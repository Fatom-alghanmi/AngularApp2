import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { About } from './about/about';
import { Reservations } from './reservations/reservations';    
import { EditReservation } from './editreservation/editreservation';

import { AddReservation } from './addreservation/addreservation';    

export const routes: Routes = [
  { path: '', redirectTo: '/reservations', pathMatch: 'full' },
  { path: 'reservations', component: Reservations },
  { path: 'addreservation', component: AddReservation },
  { path: 'editreservation/:id', component: EditReservation },
  { path: "about", component: About},

];


