# Mesa247 — Lista de espera digital

Prueba técnica para la posición **Full Stack Software Engineer — Python / FastAPI / React**.

El objetivo de este proyecto es implementar un primer corte funcional de una lista de espera digital para restaurantes.

El alcance elegido permite completar el flujo principal de punta a punta:

1. El comensal se registra en la lista de espera.
2. El comensal consulta su posición y tiempo de espera.
3. El anfitrión visualiza la cola de la sucursal.
4. El anfitrión llama a un comensal.
5. El cambio se refleja automáticamente en la vista del comensal.

---

## Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite para desarrollo local
- Pytest

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

---

## Alcance implementado

### Comensal — ingreso

Ruta:

```text
/join/:locationId
```

Permite registrar:

- Nombre
- Teléfono
- Cantidad de personas

Al completar el registro se crea una entrada con estado:

```text
WAITING
```

y el usuario es redirigido a su turno.

---

### Comensal — turno

Ruta:

```text
/queue/:entryId
```

Muestra:

- Posición actual
- Estado del turno
- Tiempo de referencia de 30 minutos
- Actualización automática de la información

El temporizador se calcula utilizando `created_at`, por lo que refrescar la página no reinicia el tiempo de espera.

Cuando el anfitrión llama al comensal, la pantalla cambia automáticamente para indicar que su turno ha llegado.

---

### Anfitrión — lista de espera

Ruta:

```text
/host/:locationId
```

Muestra:

- Sucursal actual
- Hora local de la sucursal
- Indicador día / noche
- Cantidad de comensales esperando
- Cantidad de comensales llamados
- Casos con más de 30 minutos de espera
- Tabla ordenable
- Tiempo transcurrido desde la llegada
- Indicador visual de demora
- Actualización automática cada 5 segundos
- Actualización manual

El anfitrión puede ejecutar la acción:

```text
WAITING → CALLED
```

mediante:

```http
PATCH /api/waitlist/{entry_id}/call
```

La operación no requiere body.

---

# Estructura general

```text
.
├── backend/
│   ├── app/
│   │   ├── ...
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── waitlist/
│   │   │   └── host/
│   │   └── shared/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# Requisitos

Para ejecutar el proyecto localmente:

- Python 3.11+
- Node.js 20+
- npm
- Git

No es necesario instalar MySQL para probar el proyecto localmente, ya que el corte utiliza SQLite.

---

# Ejecutar backend

Desde la raíz del proyecto:

```powershell
cd backend
```

Crear el entorno virtual:

```powershell
python -m venv .venv
```

Activarlo en Windows CMD:

```cmd
.venv\Scripts\activate.bat
```

o PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

Ejecutar FastAPI:

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# Ejecutar tests del backend

Con el entorno virtual activo:

```powershell
cd backend
python -m pytest -v
```

Los tests se concentran en comportamiento relevante del dominio y los endpoints principales.

---

# Ejecutar frontend

Abrir una segunda terminal.

Desde la raíz:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Configuración del frontend

Crear un archivo:

```text
frontend/.env
```

con:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

# URLs de demostración

## Registro del comensal

```text
http://localhost:5173/join/1
```

## Panel del anfitrión

```text
http://localhost:5173/host/1
```

El flujo recomendado para probar el sistema es:

1. Abrir `/join/1`.
2. Registrar un comensal.
3. Mantener abierta la pantalla de turno.
4. Abrir `/host/1` en otra pestaña.
5. Presionar `Llamar`.
6. Comprobar que el estado se actualiza en ambas vistas.

---

# API principal

## Registrar comensal

```http
POST /api/locations/{location_id}/waitlist
```

Ejemplo:

```json
{
  "name": "Carla",
  "phone": "+51987654321",
  "party_size": 4
}
```

---

## Consultar lista

```http
GET /api/locations/{location_id}/waitlist
```

---

## Llamar comensal

```http
PATCH /api/waitlist/{entry_id}/call
```

No requiere body.

Ejemplo:

```bash
curl -X PATCH \
  "http://localhost:8000/api/waitlist/5/call" \
  -H "accept: */*"
```

---

# Actualización de información

Para este primer corte se utiliza **polling cada 5 segundos**.

Se eligió polling en lugar de WebSockets porque:

- El piloto maneja un volumen pequeño.
- Simplifica el despliegue.
- Reduce el número de componentes necesarios.
- Es suficiente para mantener ambas vistas prácticamente sincronizadas.

En una siguiente etapa se podría evaluar comunicación en tiempo real si el comportamiento del producto lo justifica.

---

# Concurrencia

Dos anfitriones pueden estar utilizando tablets simultáneamente.

El cambio:

```text
WAITING → CALLED
```

debe validarse en backend y no depender únicamente del estado visible en React.

El frontend se actualiza periódicamente, pero la consistencia pertenece al backend.

---

# Decisiones de alcance

Este primer corte prioriza únicamente el flujo crítico:

```text
Comensal se registra
        ↓
entra en la cola
        ↓
consulta su turno
        ↓
anfitrión ve la cola
        ↓
anfitrión llama
        ↓
comensal ve el cambio
```

Quedaron deliberadamente fuera:

- WhatsApp Business
- SMS
- Drag & drop para reordenamiento
- Clientes frecuentes
- Botón "Ya no voy"
- Reporte de cierre
- Estimación predictiva de espera
- Animaciones complejas
- WebSockets
- Integración con El Libro
- Autenticación
- Panel administrativo

Estas funcionalidades se evaluarían después de validar el flujo principal del piloto.

---

# Producción

El stack objetivo indicado para el producto es Google Cloud y MySQL.

Para producción propondría:

- Backend FastAPI en Cloud Run.
- Frontend desplegado como aplicación web.
- Cloud SQL for MySQL.
- Secret Manager para credenciales.
- Logs estructurados en Cloud Logging.
- Error Reporting / alertas sobre errores 5xx.
- Health check del servicio.
- Monitoreo de latencia y disponibilidad.
- Alertas fuera de horario ante indisponibilidad.
- Migraciones de base de datos versionadas.

SQLite se utiliza únicamente para facilitar la ejecución local de esta prueba.

---

# Consideraciones de seguridad

El teléfono del comensal es información personal y no debería quedar expuesto públicamente.

Para el piloto productivo, el panel del anfitrión debería estar protegido mediante autenticación y autorización por sucursal.

No se implementó autenticación en este corte debido al límite de tiempo y porque no forma parte del flujo mínimo solicitado.

---

# Próximos pasos

En una siguiente iteración priorizaría:

1. Autenticación del anfitrión.
2. Estados adicionales del ciclo de espera.
3. Integración con El Libro.
4. Cancelación por parte del comensal.
5. Notificaciones WhatsApp/SMS.
6. Métricas y reporte diario.
7. Evaluación de tiempo estimado de espera.
8. Reordenamiento controlado de la cola.

---

## Autor

**Nombre Apellido**

Prueba técnica Mesa247 — 2026