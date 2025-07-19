import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationsService } from '../reservations/reservation.service';
import { Reservation } from '../reservation';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-editreservation',
  templateUrl: './editreservation.html',
  styleUrls: ['./editreservation.css'],
  imports: [RouterModule, FormsModule, CommonModule],
})
export class EditReservation implements OnInit {
  reservation: Reservation = {
    id: 0,
    name: '',
    date: '',
    time: '',
    guests: 1,
    location: '',
    imageName: '',
    booked: 0,
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  originalImageName: string = '';

  success = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadReservation(id);
    } else {
      this.showError('No reservation ID provided in route.');
    }
  }

  loadReservation(id: number): void {
    this.reservationService.get(id).subscribe({
      next: (res) => {
        this.reservation = res;
        if (!this.reservation.id || this.reservation.id <= 0) {
          this.reservation.id = id;
        }
        this.originalImageName = res.imageName || '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.showError('Failed to load reservation');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.reservation.imageName = this.selectedFile.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateReservation(form: NgForm): void {
    if (form.invalid || !this.reservation.id || this.reservation.id <= 0) {
      this.showError('Cannot update: form invalid or ID missing.');
      return;
    }

    // Full name validation: at least two words
  if (!this.reservation.name || this.reservation.name.trim().split(' ').length < 2) {
    this.showError('Please enter your full name (first and last name).');
    return;
  }
  
    const formData = new FormData();
    formData.append('id', this.reservation.id.toString());
    formData.append('name', this.reservation.name || '');
    formData.append('date', this.reservation.date || '');
    formData.append('time', this.reservation.time || '');
    formData.append('guests', this.reservation.guests.toString());
    formData.append('location', this.reservation.location || '');
    formData.append('booked', this.reservation.booked.toString());
    formData.append('oldImageName', this.originalImageName);
  
    if (this.selectedFile && this.selectedFile.name !== this.originalImageName) {
      formData.append('image', this.selectedFile);
    }
  
    this.http.post('http://localhost/angularapp2/reservationapi/update.php', formData).subscribe({
      next: () => {
        this.showSuccess('Reservation updated successfully');
        this.selectedFile = null;
        this.previewUrl = null;
        this.cdr.detectChanges(); 
        this.router.navigate(['/reservations']);  // cleaner reload
      },
      error: (err) => {
        if (err.status === 409) {
          // Conflict error - likely duplicate image name
          this.showError(err.error?.error || 'Image name already exists. Please choose a different image.');
        } else {
          // Other errors fallback
          this.showError(err.error?.error || 'Update failed. Please try again.');
        }
        this.cdr.detectChanges(); 
      }
    });
  }
  
  /** Auto-hide success message */
  private showSuccess(message: string): void {
    this.success = message;
    this.error = '';
    setTimeout(() => {
      this.success = '';
      this.cdr.detectChanges();
    }, 2000);
  }

  /** Auto-hide error message */
  private showError(message: string): void {
    this.error = message;
    this.success = '';
    this.cdr.detectChanges(); 


    setTimeout(() => {
      this.error = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  toggleBooked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reservation.booked = input.checked ? 1 : 0;
  }
}

