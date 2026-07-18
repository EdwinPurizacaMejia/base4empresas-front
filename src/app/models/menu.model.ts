/**
 * Modelo tipado para elementos de menú jerárquico
 * Soporta menús anidados con navegación, iconos y control de acceso
 *
 * Fase 2: iconos migrados de emojis a Material Icons (librería única)
 * Referencia: https://fonts.google.com/icons
 */

export interface MenuItem {
  /**
   * Etiqueta visible del menú
   */
  label: string;

  /**
   * Nombre del icono Material Icons (ej: 'dashboard', 'inventory')
   * Fase 2: reemplaza emojis por iconos de una sola librería
   */
  icon: string;

  /**
   * Ruta de navegación (si es undefined, es solo un contenedor de submenús)
   */
  route?: string;

  /**
   * Submenús anidados
   */
  children?: MenuItem[];

  /**
   * Badge numérico opcional (ej: notificaciones)
   */
  badge?: number;

  /**
   * Roles requeridos para ver este item (control de acceso)
   * Si está vacío, es visible para todos
   */
  requiredRoles?: string[];

  /**
   * Si es true, el item se renderiza pero está deshabilitado
   */
  disabled?: boolean;

  /**
   * Descripción tooltip del item
   */
  tooltip?: string;
}

/**
 * Configuración global del menú principal
 * Estructura centralizada para la navegación de la aplicación
 * Agrupa pantallas por dominio de negocio y 5 fases implementadas
 *
 * Fase 2: iconos actualizados a Material Icons para iconografía unificada
 */
export const MAIN_MENU: MenuItem[] = [
  // ========================================
  // Dashboard
  // ========================================
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    tooltip: 'Panel principal de control',
  },

  // ========================================
  // FASE 1: Catálogos (Maestros)
  // ========================================
  {
    label: 'Catálogos',
    icon: 'category',
    tooltip: 'Gestión de datos maestros',
    children: [
      {
        label: 'Productos',
        icon: 'inventory_2',
        route: '/catalogos/productos',
        tooltip: 'ABM de productos',
      },
      {
        label: 'Categorías',
        icon: 'label',
        route: '/catalogos/categorias',
        tooltip: 'Categorías de productos',
      },
      {
        label: 'Unidades',
        icon: 'straighten',
        route: '/catalogos/unidades',
        tooltip: 'Unidades de medida',
      },
      {
        label: 'Almacenes',
        icon: 'warehouse',
        route: '/catalogos/almacenes',
        tooltip: 'Gestión de almacenes',
      },
      {
        label: 'Canales de venta',
        icon: 'storefront',
        route: '/catalogos/canales-venta',
        tooltip: 'Canales de distribución',
      },
      {
        label: 'Clientes',
        icon: 'people',
        route: '/catalogos/clientes',
        tooltip: 'ABM de clientes',
      },
      {
        label: 'Proveedores',
        icon: 'local_shipping',
        route: '/catalogos/proveedores',
        tooltip: 'ABM de proveedores',
      },
    ],
  },

  // ========================================
  // FASE 2-3: Ventas (Pedidos + Pagos + Documentos Electrónicos)
  // ========================================
  {
    label: 'Ventas',
    icon: 'point_of_sale',
    tooltip: 'Gestión de pedidos, pagos y transacciones',
    children: [
      {
        label: 'Ventas',
        icon: 'shopping_cart',
        route: '/ventas/ventas',
        tooltip: 'Lista de ventas realizadas',
      },
      {
        label: 'Pedidos',
        icon: 'receipt_long',
        route: '/ventas/pedidos',
        tooltip: 'Órdenes de venta',
      },
      {
        label: 'Pagos',
        icon: 'payments',
        route: '/ventas/pagos',
        tooltip: 'Gestión y validación de pagos',
      },
      {
        label: 'Documentos Electrónicos',
        icon: 'description',
        route: '/ventas/documentos-electronicos',
        tooltip: 'Facturas, boletas y comprobantes electrónicos',
      },
    ],
  },

  // ========================================
  // FASE 2-4: Inventario (Stock, Kardex, Ajustes)
  // ========================================
  {
    label: 'Inventario',
    icon: 'inventory',
    tooltip: 'Control de stock, valuación y movimientos',
    children: [
      {
        label: 'Stock actual',
        icon: 'bar_chart',
        route: '/inventario/stock',
        tooltip: 'Vista de stock actual por almacén',
      },
      {
        label: 'Kardex',
        icon: 'history',
        route: '/inventario/kardex',
        tooltip: 'Historial de movimientos de inventario',
      },
      {
        label: 'Ajustes de stock',
        icon: 'tune',
        route: '/inventario/ajustes',
        tooltip: 'Registrar correcciones de inventario',
      },
      {
        label: 'Transferencias',
        icon: 'swap_horiz',
        route: '/inventario/transferencias',
        tooltip: 'Transferir entre almacenes',
      },
    ],
  },

  // ========================================
  // FASE 4: Logística (Envíos)
  // ========================================
  {
    label: 'Logística',
    icon: 'local_post_office',
    tooltip: 'Gestión de envíos y entrega de pedidos',
    children: [
      {
        label: 'Envíos',
        icon: 'move_to_inbox',
        route: '/logistica/envios',
        tooltip: 'Crear y rastrear envíos',
      },
    ],
  },

  // ========================================
  // Compras (Módulo adicional)
  // ========================================
  {
    label: 'Compras',
    icon: 'shopping_bag',
    tooltip: 'Gestión de órdenes de compra',
    children: [
      {
        label: 'Órdenes de compra',
        icon: 'assignment',
        route: '/compras/ordenes',
        tooltip: 'ABM de órdenes de compra',
      },
    ],
  },

  // ========================================
  // FASE 5: Configuración (Auditoría, Seguridad, 2FA)
  // ========================================
  {
    label: 'Configuración',
    icon: 'settings',
    tooltip: 'Auditoría, seguridad y configuración del sistema',
    children: [
      {
        label: 'Auditoría',
        icon: 'manage_search',
        route: '/config/auditoria',
        tooltip: 'Historial de auditoría y actividades',
      },
      {
        label: 'Seguridad',
        icon: 'security',
        route: '/config/seguridad',
        tooltip: 'Gestión de roles, permisos y 2FA',
      },
      {
        label: 'Configuración de costeo',
        icon: 'calculate',
        route: '/config/costeo',
        tooltip: 'Configuración de métodos de valuación de inventario',
      },
    ],
  },
];
