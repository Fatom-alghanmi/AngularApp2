import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationsService, Reservation } from './reservations.service';
import { forkJoin } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-reservations',
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css'],
  imports: [CommonModule, FormsModule],
})
export class Reservations implements OnInit {
  reservations: Reservation[] = [];
  newReservation: Partial<Reservation> = {};
  showAddForm = true;
  selectedFile: File | null = null;

  editingId: number | null = null;
  successMessage = '';
  success = '';
  error = '';

  constructor(
    private reservationService: ReservationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (res) => {
        // Convert booked to number if it's string
        this.reservations = res.data.map(item => ({
          ...item,
          booked: Number(item.booked) // force to number 0 or 1
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
  

  addReservation(form: any) {
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.newReservation.name!);
      formData.append('date', this.newReservation.date!);
      formData.append('time', this.newReservation.time!);
      formData.append('guests', this.newReservation.guests!.toString());
      formData.append('location', this.newReservation.location!);
      formData.append('booked', '0');
  
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
  
      this.reservationService.addReservationWithImage(formData).subscribe({
        next: (res) => {
          this.success = 'Reservation added successfully';
          form.resetForm();
          this.selectedFile = null;
          this.newReservation = {};
  
          // Reload full list from backend to show the newest data immediately
          this.loadReservations();
        },
        error: (err) => console.error('Add failed:', err),
      });
    }
  }
  
  deleteReservation(id: number) {
    this.reservationService.deleteReservation(id).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.id !== id);
        this.success = 'Reservation deleted successfully';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Delete failed:', err),
    });
  }

  startEditRow(id: number) {
    this.editingId = id;
  }

  saveRow(item: Reservation) {
    const fields: (keyof Reservation)[] = ['name', 'date', 'time', 'guests', 'location', 'booked'];
  
    // We'll track all update observables and wait for all to complete
    const updateObservables = fields.map(field => {
      const value = (item as any)[field];
      return this.reservationService.updateReservationField(item.id, field, value);
    });
  
    // Import forkJoin at top: import { forkJoin } from 'rxjs';
    forkJoin(updateObservables).subscribe({
      next: () => {
        this.editingId = null;    // Close edit mode
        this.success = 'Reservation updated';
        this.cdr.detectChanges(); // Force Angular to update the UI immediately
      },
      error: err => {
        console.error('Update failed', err);
        // Optional: handle error message here
      }
    });
  }
  

  toggleBooked(item: Reservation) {
    item.booked = item.booked ? 0 : 1;
    this.reservationService.updateReservationField(item.id, 'booked', item.booked).subscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  
}
