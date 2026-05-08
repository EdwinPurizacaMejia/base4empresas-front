import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  /**
   * Observable con debounce (300ms) y distinctUntilChanged aplicados
   * Úsalo en componentes para filtrado automático
   */
  readonly searchTerm$Debounced: Observable<string> = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  setSearchTerm(term: string): void {
    this.searchTerm$.next(term ?? '');
  }

  getSearchTerm(): Observable<string> {
    return this.searchTerm$.asObservable();
  }
}
