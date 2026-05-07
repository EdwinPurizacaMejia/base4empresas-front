import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  setSearchTerm(term: string): void {
    this.searchTerm$.next(term ?? '');
  }

  getSearchTerm(): Observable<string> {
    return this.searchTerm$.asObservable();
  }
}
