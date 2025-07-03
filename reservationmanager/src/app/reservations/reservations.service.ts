import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
}

@Injectable({
    providedIn: 'root'
  })
  export class ReservationsService {
    private listUrl = 'http://localhost/AngularApp2/reservationapi/list.php';
    private addUrl = 'http://localhost/AngularApp2/reservationapi/add.php';
  
    constructor(private http: HttpClient) {}
  
    getReservations(): Observable<{ data: Reservation[] }> {
      return this.http.get<{ data: Reservation[] }>(this.listUrl);
    }
  
    addReservation(data: Omit<Reservation, 'id'>): Observable<any> {
      return this.http.post<any>(this.addUrl, data);
    }
  }
  