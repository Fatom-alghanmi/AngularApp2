import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  imageName?: string;
  booked: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private listUrl = 'http://localhost/AngularApp2/reservationapi/list.php';
  private addUrl = 'http://localhost/AngularApp2/reservationapi/add.php';
  private editUrl = 'http://localhost/AngularApp2/reservationapi/edit.php';
  private deleteUrl = 'http://localhost/AngularApp2/reservationapi/delete.php';

  constructor(private http: HttpClient) {}

  getReservations(): Observable<{ data: Reservation[] }> {
    return this.http.get<{ data: Reservation[] }>(this.listUrl);
  }

  addReservationWithImage(formData: FormData): Observable<any> {
    return this.http.post(this.addUrl, formData);
  }

  updateReservationField(id: number, field: string, value: string | number | boolean): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('field', field);
    formData.append('value', value.toString());
    return this.http.post(this.editUrl, formData);
  }

  deleteReservation(id: number): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    return this.http.post(this.deleteUrl, formData);
  }

  
}
