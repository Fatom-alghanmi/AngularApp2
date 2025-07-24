import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { About } from './about/about';
import { Reservations } from './reservations/reservations'; 
import { AddReservation } from './addreservation/addreservation';   
import { EditReservation } from './editreservation/editreservation';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { authGuard } from './guards/auth-guard';


  

export const routes: Routes = [
  { path: '', redirectTo: '/reservations', pathMatch: 'full' },
  { path: 'reservations', component: Reservations },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'addreservation', component: AddReservation },
  { path: 'editreservation/:id', component: EditReservation },
  { path: "about", component: About},

];


