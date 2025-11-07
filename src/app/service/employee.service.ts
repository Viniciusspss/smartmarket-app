import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeResponse } from '../shared/models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/employees';

  getAllEmployees(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.baseUrl);
  }

  getEmployeeById(employeeId: string): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.baseUrl}/${employeeId}`);
  }

  createEmployee(employee: Omit<Employee, 'employeeId'>): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  updateEmployee(employeeId: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/${employeeId}`, employee);
  }

  deleteEmployee(employeeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${employeeId}`);
  }
}
