# Guía de Contribución

¡Gracias por tu interés en contribuir a Base4Empresas! Este documento te guiará sobre cómo colaborar con el proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Guía de Estilo](#guía-de-estilo)
- [Reportar Bugs](#reportar-bugs)

---

## Código de Conducta

Este proyecto se adhiere a un Código de Conducta que todos los participantes deben respetar:

- ✅ Sé respetuoso y profesional
- ✅ Acepta críticas constructivas
- ✅ Enfócate en lo que es mejor para la comunidad
- ✅ Muestra empatía hacia otros

---

## ¿Cómo Contribuir?

### Reportar Bugs

Si encuentras un bug:

1. Verifica que el bug no haya sido reportado antes
2. Proporciona un título claro y descriptivo
3. Describe exactamente los pasos para reproducir el problema
4. Proporciona ejemplos específicos para demostrar los pasos
5. Describe el comportamiento observado y lo que esperabas
6. Incluye capturas de pantalla si es posible

**Ejemplo:**

```
Título: Usuario no puede guardar productos con nombre vacío

Pasos para reproducir:
1. Ir a "Gestión de Productos"
2. Click en "Nuevo Producto"
3. Dejar el campo nombre vacío
4. Click en "Guardar"

Comportamiento esperado:
Mostrar un mensaje de error indicando que el nombre es requerido

Comportamiento actual:
Se guarda un producto sin nombre
```

### Sugerencias de Mejora

¿Tienes una idea para mejorar el proyecto? Nos encantaría escucharla:

1. Usa un título descriptivo
2. Proporciona una descripción detallada de la mejora sugerida
3. Proporciona ejemplos específicos para demostrar el paso
4. Describe el comportamiento actual y el esperado

---

## Proceso de Pull Request

1. **Fork el repositorio**

```bash
git clone https://github.com/TU_USUARIO/base4empresas-front.git
cd base4empresas
```

2. **Crea una rama para tu feature**

```bash
git checkout -b feature/descripcion-breve
```

Usa nombres descriptivos como:

- `feature/agregar-filtro-productos`
- `fix/corregir-calculo-stock`
- `docs/actualizar-readme`

3. **Realiza tus cambios**

- Mantén los commits pequeños y enfocados
- Escribe mensajes de commit claros

4. **Envía tus cambios**

```bash
git push origin feature/descripcion-breve
```

5. **Abre un Pull Request**

- Proporciona un título descriptivo
- Describe qué cambios hiciste y por qué
- Referencia cualquier issue relacionado (#123)
- Incluye screenshots si aplica

---

## Guía de Estilo

### Nombrado de Archivos

- **Componentes**: `kebab-case` (ej: `product-form.component.ts`)
- **Servicios**: `kebab-case` (ej: `products.service.ts`)
- **Modelos**: `PascalCase` (ej: `Product.ts`)

### TypeScript

```typescript
// ✅ Correcto
export interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ Evitar
export interface product {
  id: string;
  name: string;
  price: number;
}
```

### Angular Components

```typescript
// ✅ Correcto
@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./product-form.component.html",
  styleUrl: "./product-form.component.css",
})
export class ProductFormComponent {
  // Lógica del componente
}

// ❌ Evitar
@Component({
  selector: "ProductForm",
  // Otros detalles
})
export class productForm {
  // Lógica del componente
}
```

### HTML

```html
<!-- ✅ Correcto -->
<button [disabled]="isLoading" (click)="saveProduct()">Guardar Producto</button>

<!-- ❌ Evitar -->
<button onclick="saveProduct()" disabled="">Guardar Producto</button>
```

### CSS

```css
/* ✅ Correcto */
.product-form {
  display: flex;
  gap: 1rem;
}

.product-form__input {
  padding: 0.5rem;
}

/* ❌ Evitar */
.productForm {
  display: flex;
  gap: 1rem;
}

.input {
  padding: 0.5rem;
}
```

---

## Ejecutar Tests

Antes de enviar tu Pull Request, asegúrate de que los tests pasen:

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con cobertura
npm test -- --code-coverage
```

---

## Compilación Local

Verifica que tu código compila correctamente:

```bash
# Desarrollo
npm start

# Producción
npm run build
```

---

## Preguntas o Dudas

Si tienes preguntas sobre cómo contribuir:

- 📧 Abre un Discussion en el repositorio
- 📝 Crea un Issue con la etiqueta `question`

---

**¡Gracias por contribuir a Base4Empresas! 🎉**
