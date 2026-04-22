# Base4Empresas - Sistema de Gestión de Inventario

<div align="center">

[![Angular](https://img.shields.io/badge/Angular-17.3-red?logo=angular)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org)
[![NodeJS](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Una aplicación moderna de gestión de inventario construida con Angular 17, diseñada para empresas que necesitan controlar productos, compras, ventas y movimientos de stock de forma eficiente.

[📋 Características](#-características) • [🚀 Inicio Rápido](#-inicio-rápido) • [📁 Estructura](#-estructura-del-proyecto) • [📝 Documentación](#-documentación)

</div>

---

## 📋 Características

- ✅ **Gestión de Productos** - Crear, actualizar y eliminar productos del catálogo
- ✅ **Control de Compras** - Registrar compras de proveedores y actualizar stock automáticamente
- ✅ **Gestión de Ventas** - Procesar ventas y reducir inventario
- ✅ **Kardex** - Registro detallado de todos los movimientos de inventario
- ✅ **Resumen de Stock** - Vista general del inventario actual
- ✅ **Dashboard** - Panel de control con métricas principales
- ✅ **SSR** - Server-Side Rendering para mejor rendimiento SEO
- ✅ **Componentes Standalone** - Arquitectura moderna de Angular
- ✅ **Routing Avanzado** - Navegación fluida entre módulos

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js**: v18 o superior ([Descargar](https://nodejs.org))
- **npm**: v9 o superior (incluido con Node.js)
- **Git**: para clonar el repositorio

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/EdwinPurizacaMejia/base4empresas-front.git
cd base4empresas
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita el archivo `.env` según tus necesidades.

4. **Ejecutar en desarrollo**

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

---

## 📁 Estructura del Proyecto

```
base4empresas/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── kardex/          # Registro de movimientos
│   │   │   ├── product-form/    # Formulario de productos
│   │   │   ├── products-list/   # Listado de productos
│   │   │   ├── purchase-form/   # Formulario de compras
│   │   │   ├── purchase-list/   # Listado de compras
│   │   │   ├── sale-form/       # Formulario de ventas
│   │   │   ├── sale-list/       # Listado de ventas
│   │   │   └── stock-list/      # Resumen de stock
│   │   ├── layout/              # Componente de layout principal
│   │   ├── pages/               # Páginas/vistas
│   │   │   └── dashboard/       # Panel de control
│   │   ├── models/              # Modelos de datos (TypeScript)
│   │   │   ├── product.model.ts
│   │   │   ├── purchase.model.ts
│   │   │   ├── sale.model.ts
│   │   │   ├── stock.model.ts
│   │   │   └── kardex.model.ts
│   │   ├── services/            # Servicios de lógica de negocio
│   │   │   ├── products.service.ts
│   │   │   ├── purchase.service.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── stock.service.ts
│   │   │   └── kardex.service.ts
│   │   ├── app.routes.ts        # Definición de rutas
│   │   ├── app.config.ts        # Configuración de aplicación
│   │   ├── app.config.server.ts # Configuración SSR
│   │   └── app.component.ts     # Componente raíz
│   ├── assets/                  # Recursos estáticos
│   ├── environments/            # Configuración por entorno
│   ├── index.html              # HTML principal
│   ├── main.ts                 # Punto de entrada de la app
│   └── main.server.ts          # Punto de entrada SSR
├── .angular/                   # Archivos de configuración Angular
├── dist/                       # Build de producción
├── angular.json               # Configuración de Angular CLI
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración de TypeScript
├── tsconfig.app.json          # TypeScript para aplicación
├── tsconfig.spec.json         # TypeScript para tests
├── .env.example               # Variables de entorno (plantilla)
├── .gitignore                 # Archivos a ignorar en Git
└── README.md                  # Esta documentación
```

---

## 🛠️ Comandos Disponibles

### Desarrollo

```bash
# Servidor de desarrollo con hot reload
npm start

# Compilar en modo watch para desarrollo
npm run watch
```

### Producción

```bash
# Build optimizado para producción
npm run build

# Ejecutar servidor SSR
npm run serve:ssr:base4empresas
```

### Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con cobertura
npm test -- --code-coverage
```

### Angular CLI

```bash
# Ver ayuda de Angular CLI
npm run ng -- help

# Generar un nuevo componente
npm run ng -- generate component nombre-componente

# Generar un nuevo servicio
npm run ng -- generate service nombre-servicio
```

---

## 📊 Modelos de Datos

### Product

```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  createdAt: Date;
}
```

### Purchase

```typescript
{
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  purchaseDate: Date;
}
```

### Sale

```typescript
{
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customer: string;
  saleDate: Date;
}
```

---

## 🏗️ Arquitectura

La aplicación sigue una arquitectura basada en **componentes** con:

- **Componentes Standalone**: Componentes independientes sin módulos
- **Servicios**: Lógica de negocio centralizada
- **Modelos TypeScript**: Type-safety completo
- **Reactive Forms**: Formularios reactivos
- **RxJS**: Manejo de observables y flujos asíncronos
- **Routing**: Navegación con Angular Router

---

## 🔐 Seguridad

- ✅ Variables sensibles en archivo `.env` (nunca comitear a Git)
- ✅ TypeScript strict mode habilitado
- ✅ Sanitización de inputs en formularios
- ✅ CORS configurado para producción

---

## 📦 Dependencias Principales

| Paquete           | Versión | Propósito              |
| ----------------- | ------- | ---------------------- |
| `@angular/core`   | 17.3.0  | Framework principal    |
| `@angular/forms`  | 17.3.0  | Gestión de formularios |
| `@angular/router` | 17.3.0  | Enrutamiento           |
| `@angular/ssr`    | 17.3.17 | Server-Side Rendering  |
| `rxjs`            | 7.8.0   | Programación reactiva  |
| `express`         | 4.18.2  | Servidor backend (SSR) |
| `typescript`      | 5.4.2   | Lenguaje de tipado     |

---

## 🐛 Solución de Problemas

### Puerto 4200 ya en uso

```bash
# Usar puerto diferente
ng serve --port 4300
```

### Limpiar cache de dependencias

```bash
npm ci
npm install
```

### Limpiar build de Angular

```bash
rm -rf dist node_modules
npm install
npm run build
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios principales:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Edwin Purizaca Mejía**

- GitHub: [@EdwinPurizacaMejia](https://github.com/EdwinPurizacaMejia)
- Proyecto: [base4empresas-front](https://github.com/EdwinPurizacaMejia/base4empresas-front)

---

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

- 📝 Abre un [Issue en GitHub](https://github.com/EdwinPurizacaMejia/base4empresas-front/issues)
- 💬 Contacta directamente

---

**Última actualización:** Abril 2026
