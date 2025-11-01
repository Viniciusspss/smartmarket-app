import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserData {
  id: number;
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly API_URL = 'http://localhost:8080';

  private http = inject(HttpClient);

  public getAuthenticatedUser(): Observable<UserData> {
    return this.http.get<UserData>(`${this.API_URL}/customers/me`, {});
  }
}
