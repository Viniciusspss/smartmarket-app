import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8080/api/products';
  private http = inject(HttpClient);

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${productId}`);
  }

  updateProduct(productId: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${productId}`, product);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/me/${productId}`);
  }
}
