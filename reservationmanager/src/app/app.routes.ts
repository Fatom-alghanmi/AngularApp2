import { Routes } from '@angular/router';
import { ReservationsComponent } from './reservations/reservations';

export const routes: Routes = [
  { path: 'reservations', component: ReservationsComponent },
  { path: '', redirectTo: 'reservations', pathMatch: 'full' }
];
