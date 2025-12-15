# 📋 Documentación API - Módulo de Gastos

Documentación completa de los endpoints del módulo de Gastos del sistema SGI Avalom.

## 🔐 Autenticación

Todos los endpoints (excepto login) requieren autenticación mediante Bearer Token.

### Login

**Endpoint:** `POST /api/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "anthonyah131@gmail.com",
  "password": "123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "usu_id": "1",
    "usu_nombre": "Anthony",
    "usu_rol": "A",
    ...
  }
}
```

**Uso del Token:**
Después del login, el token debe enviarse como **cookie** en todas las peticiones:
```
Cookie: token={token}
```

**Nota:** El backend espera el token en una cookie llamada "token", no en el header Authorization.

---

## 📊 Endpoints de Gastos

### 1. Listar Gastos

**Endpoint:** `GET /api/expenses`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10)
- `estado` (opcional): 'A' (Activo) o 'D' (Anulado)
- `tipo` (opcional): 'S' (Servicio) o 'M' (Mantenimiento)
- `edi_id` (opcional): ID del edificio
- `prop_id` (opcional): ID de la propiedad
- `ser_id` (opcional): ID del servicio
- `fechaDesde` (opcional): Fecha desde (YYYY-MM-DD)
- `fechaHasta` (opcional): Fecha hasta (YYYY-MM-DD)

**Ejemplo:**
```bash
GET /api/expenses?page=1&limit=10&estado=A&tipo=S&edi_id=1&fechaDesde=2024-01-01&fechaHasta=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "gas_id": "1",
      "gas_tipo": "S",
      "gas_concepto": "Pago de luz",
      "gas_monto": "50000",
      "gas_fecha": "2024-01-15T00:00:00.000Z",
      "gas_estado": "A",
      "ava_edificio": { ... },
      "ava_propiedad": { ... },
      "ava_servicio": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 2. Crear Gasto

**Endpoint:** `POST /api/expenses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "gas_tipo": "S",
  "gas_concepto": "Pago de luz",
  "gas_descripcion": "Pago mensual de servicio eléctrico",
  "gas_monto": "50000",
  "gas_fecha": "2024-01-15T00:00:00.000Z",
  "gas_metodopago": "Transferencia",
  "gas_cuenta": "123456789",
  "gas_banco": "Banco Nacional",
  "gas_referencia": "REF-001",
  "edi_id": "1",
  "prop_id": "1",
  "ser_id": "1",
  "usu_id": "1"
}
```

**Validaciones:**
- Si `gas_tipo = "S"` (Servicio), `ser_id` es **requerido**
- Si `gas_tipo = "M"` (Mantenimiento), `ser_id` debe ser `null` o no incluirse

**Response:**
```json
{
  "success": true,
  "data": {
    "gas_id": "1",
    ...
  }
}
```

---

### 3. Obtener Gasto por ID

**Endpoint:** `GET /api/expenses/{gastoId}`

**Ejemplo:**
```bash
GET /api/expenses/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gas_id": "1",
    "gas_tipo": "S",
    ...
    "ava_anulaciongasto": [...]
  }
}
```

---

### 4. Actualizar Gasto

**Endpoint:** `PUT /api/expenses/{gastoId}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:** (Igual que crear, con todos los campos)

**Nota:** No se puede actualizar un gasto anulado.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 5. Eliminar Gasto

**Endpoint:** `DELETE /api/expenses/{gastoId}`

**Nota:** No se puede eliminar un gasto anulado.

**Response:**
```json
{
  "success": true,
  "message": "Gasto eliminado"
}
```

---

### 6. Listar Gastos Anulados

**Endpoint:** `GET /api/expenses/canceled`

**Query Parameters:**
- `page` (opcional): Número de página
- `limit` (opcional): Registros por página
- `tipo` (opcional): 'S' o 'M'
- `edi_id` (opcional): ID del edificio
- `prop_id` (opcional): ID de la propiedad
- `fechaDesde` (opcional): YYYY-MM-DD
- `fechaHasta` (opcional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

---

### 7. Anular Gasto

**Endpoint:** `POST /api/expenses/cancel/{gastoId}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "ang_motivo": "Error en el registro",
  "ang_descripcion": "Se registró por error, debe ser anulado",
  "ang_montofinal": "0"
}
```

**Nota:** El `usu_id` se extrae automáticamente del token.

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Gasto anulado correctamente"
}
```

---

### 8. Obtener Anulación por ID

**Endpoint:** `GET /api/expenses/cancelation/{angId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "ang_id": "1",
    "ang_motivo": "Error en el registro",
    "ava_gasto": { ... },
    "ava_usuario": { ... }
  }
}
```

---

## 🛠️ Endpoints de Servicios (Catálogo)

### 1. Listar Servicios

**Endpoint:** `GET /api/services`

**Query Parameters:**
- `page` (opcional): Número de página
- `limit` (opcional): Registros por página

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ser_id": "1",
      "ser_codigo": "NETFLIX-001",
      "ser_nombre": "Netflix",
      "ser_servicio": "Streaming",
      "ser_negocio": "Netflix Inc.",
      "ser_mediopago": "Tarjeta de crédito"
    }
  ],
  "pagination": { ... }
}
```

---

### 2. Crear Servicio

**Endpoint:** `POST /api/services`

**Body:**
```json
{
  "ser_codigo": "NETFLIX-001",
  "ser_nombre": "Netflix",
  "ser_servicio": "Streaming",
  "ser_negocio": "Netflix Inc.",
  "ser_mediopago": "Tarjeta de crédito"
}
```

**Campos Requeridos:**
- `ser_codigo`: Código único del servicio
- `ser_nombre`: Nombre del servicio

---

### 3. Obtener Servicio por ID

**Endpoint:** `GET /api/services/{serId}`

**Response:** Incluye los últimos 10 gastos relacionados.

---

### 4. Actualizar Servicio

**Endpoint:** `PUT /api/services/{serId}`

**Body:** (Igual que crear)

---

### 5. Eliminar Servicio

**Endpoint:** `DELETE /api/services/{serId}`

**Nota:** No se puede eliminar si tiene gastos asociados.

---

## 📄 Endpoints de Reportes (PDF)

Todos los reportes devuelven archivos PDF que se pueden descargar directamente.

### 1. Reporte de Servicios

**Endpoint:** `GET /api/expenses/reports/services`

**Query Parameters:**
- `edi_id` (requerido): ID del edificio
- `fechaDesde` (opcional): YYYY-MM-DD
- `fechaHasta` (opcional): YYYY-MM-DD

**Ejemplo:**
```bash
GET /api/expenses/reports/services?edi_id=1&fechaDesde=2024-01-01&fechaHasta=2024-12-31
```

**Response:** Archivo PDF descargable

**Contenido del Reporte:**
- Título: "REPORTE DE GASTOS - SERVICIOS"
- Información del edificio
- Rango de fechas
- Tabla con: Fecha, Servicio, Concepto, Edificio, Propiedad, Método Pago, Referencia, Monto
- Total de gastos y monto total

---

### 2. Reporte de Mantenimientos

**Endpoint:** `GET /api/expenses/reports/maintenance`

**Query Parameters:**
- `edi_id` (requerido): ID del edificio
- `fechaDesde` (opcional): YYYY-MM-DD
- `fechaHasta` (opcional): YYYY-MM-DD

**Contenido del Reporte:**
- Título: "REPORTE DE GASTOS - MANTENIMIENTOS"
- Tabla con: Fecha, Concepto, Descripción, Edificio, Propiedad, Método Pago, Referencia, Monto
- Total de gastos y monto total

---

### 3. Reporte General de Gastos

**Endpoint:** `GET /api/expenses/reports/all`

**Query Parameters:**
- `fechaDesde` (requerido): YYYY-MM-DD
- `fechaHasta` (requerido): YYYY-MM-DD

**Contenido del Reporte:**
- Combina servicios y mantenimientos
- Tabla con: Fecha, Tipo, Servicio, Concepto, Edificio, Propiedad, Método Pago, Referencia, Monto
- Resumen con totales por tipo
- Total general

---

### 4. Reporte Contable General (Ganancias/Pérdidas)

**Endpoint:** `GET /api/expenses/reports/profit-loss`

**Query Parameters:**
- `fechaDesde` (requerido): YYYY-MM-DD
- `fechaHasta` (requerido): YYYY-MM-DD

**Contenido del Reporte:**

1. **Resumen Ejecutivo:**
   - Ingresos totales
   - Gastos totales
   - Ganancia neta
   - Margen total (%)
   - Meses en ganancia vs pérdida

2. **Serie Mensual Global:**
   - Tabla con todos los meses del rango
   - Ingresos, gastos, ganancia, margen por mes
   - Variación vs mes anterior

3. **Ranking de Edificios:**
   - Top 5 por ganancia
   - Bottom 5 por pérdida

4. **Ranking de Propiedades:**
   - Top 10 por ganancia

5. **Distribución de Gastos:**
   - Por tipo (Servicios vs Mantenimiento)
   - Top 5 servicios por gasto

6. **Insights y Alertas:**
   - Meses con pérdida
   - Edificios con margen negativo
   - Gastos altos detectados

---

## 🔧 Ejemplos de Uso en Frontend

### Axios Example

```typescript
import axios from 'axios';
import cookie from 'js-cookie';

// Configurar interceptor para incluir token como cookie
axios.interceptors.request.use((config) => {
  const token = cookie.get('token');
  if (token) {
    // El backend espera el token en una cookie
    // Axios maneja las cookies automáticamente si están en document.cookie
    // O puedes configurarlo manualmente:
    config.withCredentials = true;
    // Las cookies se envían automáticamente si están configuradas en el navegador
  }
  return config;
});

// Listar gastos
const getExpenses = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || '1',
    limit: filters.limit || '10',
    ...filters
  });
  
  const response = await axios.get(`/api/expenses?${params}`);
  return response.data;
};

// Crear gasto
const createExpense = async (expenseData) => {
  const response = await axios.post('/api/expenses', expenseData);
  return response.data;
};

// Descargar reporte PDF
const downloadReport = async (type, params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/api/expenses/reports/${type}?${queryString}`, {
    responseType: 'blob'
  });
  
  // Crear URL y descargar
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `reporte_${type}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### Fetch Example

```typescript
// Listar gastos
const getExpenses = async (filters = {}) => {
  const token = cookie.get('token');
  const params = new URLSearchParams({
    page: filters.page || '1',
    limit: filters.limit || '10',
    ...filters
  });
  
  const response = await fetch(`/api/expenses?${params}`, {
    headers: {
      'Cookie': `token=${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Importante para enviar cookies
  });
  
  return await response.json();
};
```

**Nota importante:** En el navegador, las cookies se envían automáticamente si están configuradas con `js-cookie` o `document.cookie`. El header `Cookie` manual solo funciona en entornos como Postman o servidores Node.js.

---

## 📝 Notas Importantes

1. **Autenticación:** Todos los endpoints (excepto login) requieren el token enviado como **cookie** con el nombre `token`. En Postman puedes usar el header `Cookie: token={token}`, pero en el navegador las cookies se envían automáticamente si están configuradas.

2. **Paginación:** Los endpoints que devuelven listas incluyen información de paginación:
   ```json
   {
     "pagination": {
       "page": 1,
       "limit": 10,
       "total": 50,
       "totalPages": 5
     }
   }
   ```

3. **BigInt:** Los IDs y montos se devuelven como strings debido a las limitaciones de JSON con BigInt

4. **Fechas:** Formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)

5. **Estados:**
   - Gastos: 'A' (Activo), 'D' (Anulado)
   - Pagos: 'A' (Activo), 'D' (Anulado)
   - Tipos de gasto: 'S' (Servicio), 'M' (Mantenimiento)

6. **Validaciones:**
   - Gastos de servicio (tipo 'S') deben tener `ser_id`
   - Gastos de mantenimiento (tipo 'M') NO deben tener `ser_id`
   - No se puede modificar/eliminar gastos anulados

7. **Reportes PDF:** Todos los reportes devuelven archivos PDF que deben manejarse como blobs en el frontend

---

## 🚀 Base URL

**Desarrollo:**
```
http://localhost:3000
```

**Producción:**
```
https://tu-dominio.com
```

---

## 📞 Soporte

Para más información o soporte, contactar al equipo de desarrollo.

