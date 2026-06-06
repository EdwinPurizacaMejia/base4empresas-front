/**
 * Modelo tipado para elementos de menú jerárquico
 * Soporta menús anidados con navegación, iconos y control de acceso
 */

export interface MenuItem {
  /**
   * Etiqueta visible del menú
   */
  label: string;

  /**
   * Icono (emoji o clase Material Icon)
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
 */
export const MAIN_MENU: MenuItem[] = [
  // ========================================
  // Dashboard
  // ========================================
  {
    label: 'Dashboard',
    icon: '📊',
    route: '/dashboard',
    tooltip: 'Panel principal de control',
  },

  // ========================================
  // FASE 1: Catálogos (Maestros)
  // ========================================
  {
    label: 'Catálogos',
    icon: '📚',
    tooltip: 'Gestión de datos maestros',
    children: [
      {
        label: 'Productos',
        icon: '📦',
        route: '/catalogos/productos',
        tooltip: 'ABM de productos',
      },
      {
        label: 'Categorías',
        icon: '🏷️',
        route: '/catalogos/categorias',
        tooltip: 'Categorías de productos',
      },
      {
        label: 'Unidades',
        icon: '⚖️',
        route: '/catalogos/unidades',
        tooltip: 'Unidades de medida',
      },
      {
        label: 'Almacenes',
        icon: '🏢',
        route: '/catalogos/almacenes',
        tooltip: 'Gestión de almacenes',
      },
      {
        label: 'Canales de venta',
        icon: '🛒',
        route: '/catalogos/canales-venta',
        tooltip: 'Canales de distribución (FASE 1)',
      },
      {
        label: 'Clientes',
        icon: '👥',
        route: '/catalogos/clientes',
        tooltip: 'ABM de clientes validados (FASE 1)',
      },
      {
        label: 'Proveedores',
        icon: '🚚',
        route: '/catalogos/proveedores',
        tooltip: 'ABM de proveedores validados (FASE 1)',
      },
    ],
  },

  // ========================================
  // FASE 2-3: Ventas (Pedidos + Pagos)
  // ========================================
  {
    label: 'Ventas',
    icon: '💰',
    tooltip: 'Gestión de pedidos, pagos y transacciones',
    children: [
      {
        label: 'Pedidos',
        icon: '📋',
        route: '/ventas/pedidos',
        tooltip: 'Órdenes de venta (FASE 2)',
      },
      {
        label: 'Pagos',
        icon: '💳',
        route: '/ventas/pagos',
        tooltip: 'Gestión y validación de pagos (FASE 3)',
      },
    ],
  },

  // ========================================
  // FASE 2-4: Inventario (Stock, Kardex, Ajustes)
  // ========================================
  {
    label: 'Inventario',
    icon: '📦',
    tooltip: 'Control de stock, valuación y movimientos',
    children: [
      {
        label: 'Stock actual',
        icon: '📊',
        route: '/inventario/stock',
        tooltip: 'Vista de stock actual por almacén',
      },
      {
        label: 'Kardex',
        icon: '📝',
        route: '/inventario/kardex',
        tooltip: 'Historial de movimientos de inventario',
      },
      {
        label: 'Ajustes de stock',
        icon: '⚙️',
        route: '/inventario/ajustes',
        tooltip: 'Registrar correcciones de inventario',
      },
      {
        label: 'Transferencias',
        icon: '↔️',
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
    icon: '🚚',
    tooltip: 'Gestión de envíos y entrega de pedidos',
    children: [
      {
        label: 'Envíos',
        icon: '📮',
        route: '/logistica/envios',
        tooltip: 'Crear y rastrear envíos (FASE 4)',
      },
    ],
  },

  // ========================================
  // Compras (Módulo adicional)
  // ========================================
  {
    label: 'Compras',
    icon: '🛍️',
    tooltip: 'Gestión de órdenes de compra',
    children: [
      {
        label: 'Órdenes de compra',
        icon: '📦',
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
    icon: '⚙️',
    tooltip: 'Auditoría, seguridad y configuración del sistema',
    children: [
      {
        label: 'Auditoría',
        icon: '📋',
        route: '/config/auditoria',
        tooltip: 'Historial de auditoría y actividades (FASE 5)',
      },
      {
        label: 'Seguridad',
        icon: '🔒',
        route: '/config/seguridad',
        tooltip: 'Gestión de roles, permisos y 2FA (FASE 5)',
      },
      {
        label: 'Configuración de costeo',
        icon: '💹',
        route: '/config/costeo',
        tooltip: 'Configuración de métodos de valuación de inventario',
      },
    ],
  },
];
