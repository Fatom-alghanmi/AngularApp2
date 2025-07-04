import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationsService, Reservation } from './reservations.service';

@Component({
  standalone: true,
  selector: 'app-reservations',
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css'],
  imports: [CommonModule, FormsModule],
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  newReservation: Partial<Reservation> = {};
  showAddForm = false;
  selectedFile: File | null = null;
  editableValue: string = '';
  editing: { [key: string]: boolean } = {};

  locations: string[] = ['Maple Park', 'Pine Woods', 'River Valley', 'Central Park'];

  constructor(
    private reservationService: ReservationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getReservations();
  }

  getReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (res) => {
        this.reservations = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  addReservation(form: any) {
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.newReservation.name!);
      formData.append('date', this.newReservation.date!);
      formData.append('time', this.newReservation.time!);
      formData.append('guests', this.newReservation.guests!.toString());
      formData.append('location', this.newReservation.location!);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.reservationService.addReservationWithImage(formData).subscribe({
        next: () => {
          this.showAddForm = false;
          this.newReservation = {};
          this.selectedFile = null;
          this.getReservations();
        },
        error: (err) => console.error('Add failed:', err),
      });
    }
  }

  isEditing(item: any, field: string): boolean {
    return this.editing[`${item.reservationID}_${field}`] === true;
  }

  startEdit(item: any, field: string) {
    this.editing = {}; // allow only one field editing at a time
    this.editing[`${item.reservationID}_${field}`] = true;
    this.editableValue = item[field];
  }

  saveEdit(item: any, field: string) {
    item[field] = this.editableValue;
    this.editing[`${item.reservationID}_${field}`] = false;

    const formData = new FormData();
    formData.append('id', item.reservationID); // assuming your ID column is reservationID
    formData.append(field, item[field]);

    this.reservationService.updateReservationWithImage(formData).subscribe(() => {
      this.getReservations();
    });
  }
}
