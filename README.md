# Sistema Integral de Satisfacción Ciudadana
### Municipalidad de Río Cuarto · Dirección de Estadística · Gabinete Social + LMetB

Ecosistema analítico y participativo para la recolección, medición continua y monitoreo en tiempo real de la calidad de atención percibida por los vecinos en la **Red de Salud Municipal** y la **Red de Educación Inicial** de la ciudad de Río Cuarto.

---

## 🏛️ Estructura del Ecosistema

### 1. Centro de Control y Difusión
- **[`index.html`](index.html)**: Portal central interactivo para la gestión de canales de difusión, generación de cartelería oficial con código QR (A4 para salas de espera y consultorios) y generador de mensajes y enlaces precompletados por WhatsApp.

### 2. Salud Municipal (CAPS, CS, S24 y Postas Sanitarias)
- **[`encuesta-salud.html`](encuesta-salud.html)**: Formulario accesible de satisfacción para pacientes (Recepción, Tiempo de Espera, Infraestructura, Enfermería, Atención Médica y NPS 0-10).
- **[`tablero-salud.html`](tablero-salud.html)**: Monitor analítico en tiempo real con cálculo de NPS Global, ranking de profesionales, comparativas entre centros y análisis de tiempos de espera.

### 3. Educación Municipal (Salas Cuna y Jardines Maternales)
- **[`encuesta-educacion.html`](encuesta-educacion.html)**: Formulario anónimo para familias estructurado en 7 bloques (Inscripción, Organización, Infraestructura, Desempeño Docente por subdimensiones, Personal Auxiliar, Oportunidades de Mejora y NPS Institucional).
- **[`tablero-educacion.html`](tablero-educacion.html)**: Tablero multidimensional de gestión con gráfico radial, comparativas por institución, segmentación por antigüedad de vínculo y muro de testimonios.

### 4. Backend y Base de Datos (Google Sheets + Apps Script)
- **[`backend/catalogo.js`](backend/catalogo.js)**: Catálogo maestro con el padrón oficial de 24 efectores de salud y 24 instituciones educativas con sus respectivos turnos, salas, docentes y especialidades.
- **[`backend/apps-script.gs`](backend/apps-script.gs)**: Código de Google Apps Script para la recepción de respuestas vía API REST (POST) y entrega de datos en vivo a los tableros (GET) en las pestañas **«Salud»** y **«Educación»**.
- **[`backend/CONEXION_GOOGLE_SHEETS.md`](backend/CONEXION_GOOGLE_SHEETS.md)**: Manual técnico de conexión y detalle de las columnas de la base de datos.

---

## 🚀 Despliegue y Conexión

1. **Google Sheets:** Abrir el Google Sheet de destino, pegar el código de `backend/apps-script.gs`, ejecutar `inicializarHojas` e implementar como Aplicación Web (con acceso a *Cualquier usuario*).
2. **Configuración:** Colocar la URL generada en la variable `SCRIPT_URL` de los formularios y tableros.
