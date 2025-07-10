import { Component } from '@angular/core';
import { Reservations } from './reservations/reservations';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Reservations, HttpClientModule],
  template: `<app-reservations></app-reservations>`,
})
export class App {

  protected title = 'reservationmanager';
}