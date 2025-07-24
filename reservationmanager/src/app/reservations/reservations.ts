import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReservationsService } from '../reservations/reservation.service';
import { Reservation } from '../reservation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-reservations',
  standalone: true,
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css'],
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],
})
export class Reservations implements OnInit, OnDestroy {
  reservations: Reservation[] = [];
  success = '';
  error = '';
  userName = '';
  private routerSubscription?: Subscription;

  constructor(
    private reservationService: ReservationsService,
    private cdr: ChangeDetectorRef,
    public authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === '/reservations') {
          this.loadReservations();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe({
      next: (res) => {
        this.reservations = res.data;
        this.showSuccess('Reservations loaded successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Failed to load reservations');
        console.error(err);
      },
    });
  }

  deleteReservation(id: number): void {
    const confirmed = window.confirm("Are you sure you want to delete this reservation?");
    if (!confirmed) return;

    this.success = '';
    this.error = '';

    this.reservationService.delete(id).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(item => item.id !== id);
        this.showSuccess("Reservation deleted successfully");
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to delete reservation');
        console.error('Delete error:', err);
      }
    });
  }

  navigateToAdd(): void {
    this.router.navigate(['/addreservation']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/editreservation', id]);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  /** Show success message with auto-hide */
  showSuccess(message: string): void {
    this.success = message;
    setTimeout(() => {
      this.success = '';
      this.cdr.detectChanges();
    }, 2000);
  }

  /** Show error message with auto-hide */
  showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  toggleBooked(item: Reservation): void {
    const newStatus = item.booked === 1 ? 0 : 1;
    item.booked = newStatus; // Optimistic UI update
  
    const formData = new FormData();
    formData.append('id', item.id.toString());
    formData.append('booked', newStatus.toString());
  
    this.reservationService.updateBookedStatus(formData).subscribe({
      next: () => {
        this.showSuccess('Booked status updated');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Failed to update booked status');
        item.booked = newStatus === 1 ? 0 : 1; // Revert UI
        this.cdr.detectChanges();
      }
    });
  }
  
}
