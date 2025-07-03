import { Component } from '@angular/core';
import { ReservationsComponent } from './reservations/reservations';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReservationsComponent, HttpClientModule],
  template: `<app-reservations></app-reservations>`,
})
export class App {

  protected title = 'reservationmanager';
}
