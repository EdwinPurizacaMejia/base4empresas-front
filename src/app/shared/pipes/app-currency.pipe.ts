import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

/**
 * AppCurrencyPipe
 * 
 * Pipe personalizado para formatear monedas del sistema.
 * 
 * Uso:
 * {{ amount | appCurrency }}                    // S/ 1,234.56 (PEN por defecto)
 * {{ amount | appCurrency: 'USD' }}             // $ 1,234.56
 * {{ amount | appCurrency: order.currency }}    // Dinámico
 * 
 * Soporta:
 * - PEN: Soles Peruanos (S/)
 * - USD: Dólares Americanos ($)
 * - EUR: Euros (€)
 * 
 * Manejo de null/undefined: Muestra S/ 0.00
 */
@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe: CurrencyPipe;

  constructor() {
    this.currencyPipe = new CurrencyPipe('es-PE');
  }

  transform(
    value: number | string | null | undefined,
    currencyCode?: string
  ): string {
    // Manejar null/undefined
    if (value === null || value === undefined || value === '') {
      return this.formatCurrency(0, currencyCode || 'PEN');
    }

    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Validar que sea un número válido
    if (isNaN(numValue)) {
      return this.formatCurrency(0, currencyCode || 'PEN');
    }

    // Usar PEN como default si no se especifica moneda
    const code = currencyCode || 'PEN';

    return this.formatCurrency(numValue, code);
  }

  private formatCurrency(value: number, code: string): string {
    // Mapeo de códigos a símbolos
    const currencySymbols: { [key: string]: string } = {
      'PEN': 'S/',
      'USD': '$',
      'EUR': '€'
    };

    const symbol = currencySymbols[code] || 'S/';

    // Formatear con 2 decimales
    return this.currencyPipe.transform(value, code, 'symbol-narrow', '1.2-2') || `${symbol} 0.00`;
  }
}
