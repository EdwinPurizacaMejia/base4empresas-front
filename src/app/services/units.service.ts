import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface UnitDto {
  id: number | string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.buildUrl('/units');
  }

  /**
   * API: GET /units (ej: http://localhost:8001/units)
   */
  listUnits(): Observable<UnitDto[]> {
    return this.http.get<UnitDto[]>(this.apiUrl, {
      headers: { accept: 'application/json' }
    });
  }
}
