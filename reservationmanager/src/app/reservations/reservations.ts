import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { ReservationsService } from './reservations.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ THIS is the critical fix
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css']
})
export class ReservationsComponent implements OnInit {
  reservation = {
    name: '',
    date: '',
    time: '',
    guests: 1,
    location: ''
  };

  reservations: any[] = [];

  constructor(private reservationService: ReservationsService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getReservations().subscribe(res => {
      this.reservations = res.data;
    });
  }

  addReservation(form: NgForm) {
    if (form.valid) {
      this.reservationService.addReservation(this.reservation).subscribe(() => {
        this.loadReservations(); // Refresh list
        form.resetForm(); // Clear form
      });
    }
  }
}
