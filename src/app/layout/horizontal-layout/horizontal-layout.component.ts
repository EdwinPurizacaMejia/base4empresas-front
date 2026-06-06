import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchService } from '../../services/search.service';
import { MainMenuComponent } from '../main-menu.component';

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MainMenuComponent,
  ],
  templateUrl: './horizontal-layout.component.html',
  styleUrls: ['./horizontal-layout.component.scss']
})
export class HorizontalLayoutComponent {
  searchTerm: string = '';

  constructor(private searchService: SearchService) {
    console.log('🎨 HorizontalLayoutComponent inicializado con nuevo menú jerárquico');
  }

  /**
   * Maneja el evento de búsqueda
   */
  onSearchInput(term: string): void {
    this.searchService.setSearchTerm(term);
  }
}
