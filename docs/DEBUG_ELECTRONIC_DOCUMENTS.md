# 🔍 Debugging: Documentos Electrónicos - Instrucciones

## 📋 Logs Implementados

He agregado logs detallados en la consola del navegador para diagnosticar el problema de carga.

## 🎯 Cómo Capturar los Logs

### 1. Abrir DevTools

- Presiona `F12` o `Ctrl+Shift+I` (Linux/Windows)
- Ve a la pestaña **Console**

### 2. Limpiar la Consola

- Click en el icono 🚫 (Clear console) o presiona `Ctrl+L`

### 3. Navegar al Componente

- En la aplicación, navega a: **Ventas > Documentos Electrónicos**

### 4. Observar los Logs

Deberías ver una secuencia de logs con emojis:

```
🚀 [ElectronicDocumentsListComponent] ngOnInit ejecutado
  ⏱️ Timestamp: 2026-08-07T23:49:00.000Z

📥 [ElectronicDocumentsListComponent] loadDocuments() iniciado
  📄 Página actual: 1
  📊 Page size: 20
  ⏳ Loading = true
  🔍 Filtros preparados: {page: 1, page_size: 20, ...}
  🚀 Llamando a documentsService.listDocuments()...

🔍 [ElectronicDocumentsService] Iniciando petición...
  📍 URL completa: http://127.0.0.1:8000/api/v1/electronic-documents?page=1&page_size=20
  📋 Filtros: {page: 1, page_size: 20}
  🔗 Base URL: http://127.0.0.1:8000/api/v1/electronic-documents
  ⏱️ Timestamp: 2026-08-07T23:49:00.100Z

✅ [ElectronicDocumentsService] Respuesta recibida
  ⏱️ Duración: 45.30 ms
  📊 Response: {items: [], total: 0, page: 1, ...}
  📦 Items recibidos: 0
  📄 Total: 0

✅ [ElectronicDocumentsListComponent] Respuesta recibida en componente
  📦 Response completa: {items: [], total: 0, ...}
  📋 Items: []
  📊 Total: 0
  ✅ Estado actualizado - loading = false
  📝 documents.length: 0

🏁 [ElectronicDocumentsListComponent] Observable completado
```

## 🔍 Qué Información Buscar

### ✅ Si funciona correctamente:

- Todos los emojis ✅ y 🚀 aparecen en orden
- La URL muestra: `http://127.0.0.1:8000/api/v1/electronic-documents?page=1&page_size=20`
- La duración es < 1000ms (menos de 1 segundo)
- La respuesta tiene estructura correcta

### ❌ Si hay un error:

Verás logs con emoji ❌:

```
❌ [ElectronicDocumentsListComponent] Error en petición
  ❌ Error completo: {... detalles del error ...}
  ❌ Status: 500 (o el código de error)
  ❌ Message: "mensaje del error"
  ❌ URL: "la URL que falló"
```

### ⚠️ Si tarda mucho:

- Observa si el log de "Iniciando petición..." aparece
- Observa si el log de "Respuesta recibida" aparece
- Verifica el tiempo de duración en milisegundos

## 📸 Capturar Información para Debugging

Por favor, copia TODOS los logs que aparezcan en la consola y proporciona:

1. **Todos los logs con emojis** desde 🚀 hasta 🏁 (o ❌ si hay error)
2. **La pestaña Network** del DevTools:
   - Ve a la pestaña "Network"
   - Busca la petición a `electronic-documents`
   - Click en ella y copia:
     - Headers (Request Headers y Response Headers)
     - Response (la respuesta completa)
     - Timing (cuánto tardó cada fase)

## 🛠️ Problemas Comunes y Qué Buscar

### Problema 1: No aparece ningún log 🚀

**Causa**: El componente no se está cargando
**Qué hacer**:

- Verificar que estás en la ruta correcta
- Verificar errores en la consola (sin emojis)

### Problema 2: Aparece 🚀 pero no aparece 🔍

**Causa**: El servicio no se está ejecutando
**Qué hacer**:

- Ver si hay errores de inyección de dependencias
- Verificar que ApiConfigService está funcionando

### Problema 3: Aparece 🔍 pero nunca llega ✅

**Causa**: La petición HTTP está colgada o tardando mucho
**Qué hacer**:

- Revisar pestaña Network para ver el estado de la petición
- Verificar que el backend esté corriendo en puerto 8000
- Verificar CORS

### Problema 4: Aparece ❌ con error

**Causa**: Error en la petición HTTP
**Qué hacer**:

- Leer el mensaje de error completo
- Verificar el status code
- Verificar la URL que se está llamando

## 📋 Checklist de Verificación

Antes de reportar el problema, verifica:

- [ ] El backend está corriendo en `http://localhost:8000`
- [ ] El curl manual funciona y retorna status 200
- [ ] La aplicación Angular está corriendo en `http://localhost:4200`
- [ ] No hay errores de CORS en la consola
- [ ] El navegador tiene DevTools abierto en la pestaña Console
- [ ] Los logs con emojis están apareciendo
- [ ] Has copiado TODOS los logs para compartir

## 🎯 Próximos Pasos

Una vez que captures los logs, compártelos para poder:

1. Identificar en qué punto exacto se detiene el flujo
2. Ver si la URL está correcta
3. Ver cuánto tiempo tarda la petición
4. Identificar si hay un error específico
5. Determinar la causa raíz del problema

---

**Nota**: Estos logs son temporales para debugging. Una vez resuelto el problema, se pueden remover o reducir.
