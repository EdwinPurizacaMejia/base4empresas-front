# Prompt para Backend: Especificación de POST /stock/adjustments

Necesito la especificación completa del endpoint `POST /stock/adjustments` para alinear el frontend.

## Solicitud

Por favor proporciona la siguiente información del endpoint:

### 1. Request Body Schema

Muestra el modelo Pydantic completo para `StockAdjustmentCreate`:

```python
# Ejemplo de lo que necesito ver:
class StockAdjustmentCreate(BaseModel):
    warehouse_id: str
    items: List[AdjustmentItem]
    performed_by: str
    notes: Optional[str]
    # ... otros campos
```

### 2. Response Schema

Muestra el modelo Pydantic completo para `StockAdjustmentResponse`:

```python
# Ejemplo de lo que necesito ver:
class StockAdjustmentResponse(BaseModel):
    id: str
    adjustment_number: str
    warehouse_id: str
    items: List[AdjustmentItem]
    # ... otros campos con sus tipos exactos
```

### 3. Modelos Anidados

Muestra los modelos relacionados:

```python
class AdjustmentItem(BaseModel):
    # campos aquí

class AdjustmentReason(str, Enum):
    # valores del enum aquí
```

### 4. Ejemplo de Request

```json
{
  "warehouse_id": "uuid-example",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 10,
      "reason": "CORRECTION",
      "notes": "opcional"
    }
  ],
  "performed_by": "user_id",
  "notes": "Ajuste de inventario"
}
```

### 5. Ejemplo de Response

```json
{
  "id": "uuid",
  "adjustment_number": "ADJ-000001",
  "warehouse_id": "uuid",
  "items": [...],
  "status": "completed",
  "created_at": "2026-01-01T10:00:00",
  "performed_by": "user_id"
}
```

### 6. Validaciones y Reglas

- ¿Qué campos son obligatorios?
- ¿Qué campos son opcionales?
- ¿Hay valores por defecto?
- ¿Hay validaciones especiales?
- ¿El campo `quantity` puede ser negativo?

## Formato de Respuesta Esperado

```markdown
## POST /stock/adjustments

### Request (StockAdjustmentCreate)

- warehouse_id: str (required)
- items: List[AdjustmentItem] (required)
- performed_by: str (required)
- notes: Optional[str]

### AdjustmentItem

- product_id: str (required)
- quantity: int (required, puede ser positivo o negativo)
- reason: AdjustmentReason (required)
- notes: Optional[str]

### AdjustmentReason (Enum)

- CORRECTION
- DAMAGE
- EXPIRY
- LOSS
- FOUND
- OTHER

### Response (StockAdjustmentResponse)

- id: str
- adjustment_number: str
- warehouse_id: str
- items: List[AdjustmentItem]
- status: str
- created_at: str (ISO datetime)
- updated_at: Optional[str] (ISO datetime)
- performed_by: str
- notes: Optional[str]
```

## Archivos Relevantes

Por favor busca en:

- `app/schemas/stock_adjustment.py`
- `app/routers/stock_operations.py`
- `app/models/stock_movement.py`
