import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReservationsService } from '../reservations/reservation.service';
import { Reservation } from '../reservation';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-addreservation',
  standalone: true,
  templateUrl: './addreservation.html',
  styleUrls: ['./addreservation.css'],
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  providers: [ReservationsService],
})
export class AddReservation {
  reservation: Reservation = {
    id: 0,
    name: '',
    date: '',
    time: '',
    guests: 1,
    location: '',
    imageName: '',
    booked: 1,
  };

  success = '';
  error = '';
  userName = '';
  selectedFile: File | null = null;
 

  constructor(
    private reservationService: ReservationsService,
    private router: Router,
    public authService: Auth,
    private cdr: ChangeDetectorRef 
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  addReservation(f: NgForm): void {
    this.clearMessages();
    console.log('Submitting reservation:', this.reservation);

    


    // Custom full name validation (at least two words)
  if (!this.reservation.name || this.reservation.name.trim().split(' ').length < 2) {
    this.showError('Please enter your full name (first and last name).');
    return;
  }

    const formData = new FormData();
    formData.append('name', this.reservation.name);
    formData.append('date', this.reservation.date);
    formData.append('time', this.reservation.time);
    formData.append('guests', this.reservation.guests.toString());
    formData.append('location', this.reservation.location);
    formData.append('booked', this.reservation.booked.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.reservationService.addReservationWithImage(formData).subscribe({
      next: () => {
        this.showSuccess('Reservation added successfully.');
        f.reset();
        setTimeout(() => {
          this.router.navigate(['/reservations']);
        }, 1000);
      },
      error: (err) => {
        console.error('Add Reservation Error:', err);

        const backendMessage = err?.error?.error || err?.error?.message;

        if (err.status === 409) {
          this.showError(backendMessage || 'Duplicate reservation or image detected.');
        } else {
          this.showError(backendMessage || 'Failed to add reservation. Please try again.');
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/reservations']);
  }

  private showSuccess(message: string): void {
    this.success = message;
    this.error = '';
    this.cdr.detectChanges(); 


    setTimeout(() => {
      this.success = '';
      this.cdr.detectChanges(); 
    }, 2000);
  }

  private showError(message: string): void {
    this.error = message;
    this.success = '';
    this.cdr.detectChanges();


    setTimeout(() => {
      this.error = '';
      this.cdr.detectChanges(); 
    }, 3000);
  }

  private clearMessages(): void {
    this.success = '';
    this.error = '';
    this.cdr.detectChanges(); 
  }
}
