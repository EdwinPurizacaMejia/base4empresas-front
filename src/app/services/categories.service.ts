import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CategoryDto {
  id: number | string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/categories');
  }

  listCategories(): Observable<CategoryDto[]> {
    // API: GET http://localhost:8001/categories
    return this.http.get<CategoryDto[]>(this.apiUrl, {
      headers: { accept: 'application/json' }
    });
  }
}
