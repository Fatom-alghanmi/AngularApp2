import { Routes } from '@angular/router';
import { Reservations } from './reservations/reservations';

export const routes: Routes = [
  { path: 'reservations', component: Reservations },
  { path: '', redirectTo: 'reservations', pathMatch: 'full' }
];