import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, defer, timeout, tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronicDocumentsTestService {
  constructor(private http: HttpClient) {}

  testList(): Observable<any> {
    return defer(() => {
      console.log('[TEST SERVICE] SUBSCRIBED - firing request');

      return this.http.get(
        'http://localhost:8000/api/v1/electronic-documents/?page=1&page_size=20'
      );
    }).pipe(
      timeout(5000),
      tap((response) => console.log('[TEST SERVICE] TAP RESPONSE:', response)),
      finalize(() => console.log('[TEST SERVICE] FINALIZE'))
    );
  }
}