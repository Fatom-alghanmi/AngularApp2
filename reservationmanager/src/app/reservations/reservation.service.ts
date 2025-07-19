import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../reservation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  baseUrl = 'http://localhost/AngularApp2/reservationapi';

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ data: Reservation[] }> {
    return this.http.get<{ data: Reservation[] }>(`${this.baseUrl}/list.php`);
  }

  get(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`http://localhost/angularapp2/reservationapi/get.php?id=${id}`);
  }
  

  add(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}/add.php`, reservation);
  }

  addReservationWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add.php`, formData);
  }

  update(reservation: Reservation): Observable<any> {
    return this.http.put(`${this.baseUrl}/update.php`, reservation);
  }

  delete(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/delete.php?id=${id}`);
  }
  
  updateBookedStatus(formData: FormData) {
    return this.http.post<any>('http://localhost/angularapp2/reservationapi/updateBooked.php', formData);
  }
  
}
