# Guía de Conexión y Estructura de BBDD: Google Sheets + Apps Script

Esta guía detalla la configuración del Google Sheet centralizado que actúa como base de datos en tiempo real para las **Encuestas de Satisfacción Ciudadana (Salud y Educación)** y los **Tableros de Control** de la Municipalidad de Río Cuarto.

---

## 1. Estructura de Hojas y Columnas en Google Sheets

El documento se organiza en dos hojas de datos principales:

### Hoja 1: «Salud» (18 Columnas)
*Color de pestaña: Celeste Institucional (#009DE0)*

| N° | Columna | Campo / Mapeo | Descripción / Tipo |
|---|---|---|---|
| **1** | `ID` | `uniqueId` | Identificador único (`SAL-YYYYMMDD-HHMMSS-XXX`) |
| **2** | `Fecha_Hora` | `fecha_hora` | Marca temporal de registro (`yyyy-MM-dd HH:mm:ss`) |
| **3** | `Centro_ID` | `centro_id` | Código identificador (`CS_CABRERA`, `CAPS_01`, etc.) |
| **4** | `Centro_Nombre` | `centro_nombre` | Nombre oficial del Centro de Salud / CAPS / S24 |
| **5** | `Tipo_Centro` | `tipo_centro` | Centro de Salud Central / CAPS / S24 / Posta |
| **6** | `Barrio` | `barrio` | Barrio de ubicación |
| **7** | `Llegada` | `llegada` | `Con turno previo` / `Demanda espontánea / Guardia` |
| **8** | `Especialidad` | `especialidad` | Especialidad consultada (Padrón oficial 2026) |
| **9** | `Profesional` | `profesional` | Nombre del médico / `Profesional de Turno` |
| **10** | `Recepcion_Nota` | `recepcion_nota` | Calificación Mostrador / Recepción (1 a 5) |
| **11** | `Espera_Nota` | `espera_nota` | Calificación Tiempo de Espera (1 a 5) |
| **12** | `Infraestructura_Nota` | `infraestructura_nota` | Calificación Instalaciones y Limpieza (1 a 5) |
| **13** | `Enfermeria_Nota` | `enfermeria_nota` | Atención de Enfermería (1 a 5 o `No aplica`) |
| **14** | `Medico_Nota` | `medico_nota` | Atención Médica (1 a 5 o `No aplica`) |
| **15** | `NPS_Puntaje` | `nps_puntaje` | Recomendación NPS (0 a 10) |
| **16** | `NPS_Categoria` | `nps_categoria` | Clasificación automática (`Promotor` / `Pasivo` / `Detractor`) |
| **17** | `Sugerencias` | `sugerencias` | Comentario y sugerencia abierta del vecino |
| **18** | `Dispositivo` | `dispositivo` | `Mobile` / `Desktop` |

---

### Hoja 2: «Educación» (43 Columnas)
*Color de pestaña: Verde Institucional (#00C96B)*

| N° | Columna | Campo / Mapeo | Descripción / Pregunta |
|---|---|---|---|
| **1** | `ID` | `uniqueId` | Identificador único (`EDU-YYYYMMDD-HHMMSS-XXX`) |
| **2** | `Fecha_Hora` | `fecha_hora` | Marca temporal de registro (`yyyy-MM-dd HH:mm:ss`) |
| **3** | `Institucion_ID` | `institucion_id` | Código institucional (`JARDIN_01`, `SALA_CUNA_05`, etc.) |
| **4** | `Institucion_Nombre` | `institucion_nombre` | **P1**: Nombre del Jardín Maternal / Sala Cuna |
| **5** | `Tipo_Institucion` | `tipo_institucion` | Jardín Maternal Municipal / Sala Cuna |
| **6** | `Barrio` | `barrio` | Barrio de la institución |
| **7** | `Turno` | `turno` | Turno Mañana / Turno Tarde |
| **8** | `Sala` | `sala` | Sala Lactantes / 1 año / 2 años / 3 años |
| **9** | `Tiempo_Asistencia` | `tiempo_asistencia` | **P2**: `Este año` / `Más de 1 año` / `Más de 2 años` |
| **10** | `Atencion_Inscripcion_Nota` | `atencion_inscripcion_nota` | **P3**: Atención en inscripción y comunicación (1 a 5) |
| **11** | `Horarios_Organizacion_Nota` | `horarios_organizacion_nota` | **P4**: Horarios y organización (1 a 5 o N/A) |
| **12** | `Ingreso_Egreso_Nota` | `ingreso_egreso_nota` | **P5**: Dinámica de ingreso y egreso (1 a 5 o N/A) |
| **13** | `Normas_Claras_Nota` | `normas_claras_nota` | **P6**: Claridad en normas de convivencia (1 a 5 o NS/NR) |
| **14** | `Respuesta_Institucional_Nota` | `respuesta_institucional_nota` | **P7**: Respuestas a inquietudes de familias (1 a 5 o N/A) |
| **15** | `Infraestructura_Instalaciones_Nota` | `infraestructura_instalaciones_nota` | **P8**: Estado del edificio e instalaciones (1 a 5 o N/A) |
| **16** | `Seguridad_Espacio_Nota` | `seguridad_espacio_nota` | **P9**: Condiciones de seguridad y cuidado (1 a 5 o N/A) |
| **17** | `Materiales_Recursos_Nota` | `materiales_recursos_nota` | **P10**: Material didáctico, juegos y equipamiento (1 a 5 o N/A) |
| **18** | `Limpieza_Espacio_Nota` | `limpieza_espacio_nota` | **P11**: Limpieza e higiene del espacio (1 a 5 o N/A) |
| **19** | `Docente_Nombre` | `docente_nombre` | **P12a**: Nombre de la docente a cargo de sala |
| **20** | `Docente_Info_Actividades_Nota` | `docente_info_actividades_nota` | **P12b**: Info sobre actividades y avances cotidianos (1 a 5) |
| **21** | `Docente_Canales_Adecuados_Nota` | `docente_canales_adecuados_nota` | **P12c**: Canales de comunicación claros (1 a 5) |
| **22** | `Docente_Info_Clara_Nota` | `docente_info_clara_nota` | **P12d**: Información clara y comprensible (1 a 5) |
| **23** | `Docente_Espacios_Escucha_Nota` | `docente_espacios_escucha_nota` | **P12e**: Espacios de diálogo y escucha a familias (1 a 5) |
| **24** | `Docente_Comunicacion_Fluida_Nota` | `docente_comunicacion_fluida_nota` | **P12f**: Comunicación cotidiana fluida y respetuosa (1 a 5) |
| **25** | `Docente_Sentirse_Escuchado_Nota` | `docente_sentirse_escuchado_nota` | **P12g**: La familia se siente escuchada y acompañada (1 a 5) |
| **26** | `Docente_Vinculo_Nino_Nota` | `docente_vinculo_nino_nota` | **P12h**: Vínculo afectuoso y positivo con el niño/a (1 a 5) |
| **27** | `Docente_Contencion_Nota` | `docente_contencion_nota` | **P12i**: Acompañamiento y contención cotidiana (1 a 5) |
| **28** | `Docente_Conoce_Particularidades_Nota` | `docente_conoce_particularidades_nota` | **P12j**: Conoce particularidades y tiempos del niño/a (1 a 5) |
| **29** | `Docente_Tranquilidad_Confianza_Nota` | `docente_tranquilidad_confianza_nota` | **P12k**: Tranquilidad y confianza al dejar al niño/a (1 a 5) |
| **30** | `Docente_Trato_Afectuoso_Nota` | `docente_trato_afectuoso_nota` | **P12l**: Trato afectuoso, digno y cuidado al niño/a (1 a 5) |
| **31** | `Docente_Atencion_Necesidades_Nota` | `docente_atencion_necesidades_nota` | **P12m**: Atención a necesidades (alimento, higiene) (1 a 5) |
| **32** | `Docente_Ambiente_Seguro_Nota` | `docente_ambiente_seguro_nota` | **P12n**: Ambiente seguro y protector para la infancia (1 a 5) |
| **33** | `Docente_Propuestas_Adecuadas_Nota` | `docente_propuestas_adecuadas_nota` | **P12o**: Propuestas acordes a la etapa evolutiva (1 a 5) |
| **34** | `Docente_Experiencias_Juego_Nota` | `docente_experiencias_juego_nota` | **P12p**: Experiencias significativas de juego y arte (1 a 5) |
| **35** | `Docente_Variedad_Propuestas_Nota` | `docente_variedad_propuestas_nota` | **P12q**: Variedad e innovación pedagógica (1 a 5) |
| **36** | `Auxiliar_Nombre` | `auxiliar_nombre` | **P13a**: Personal auxiliar o Equipo Auxiliar |
| **37** | `Auxiliar_Desempeno_Nota` | `auxiliar_desempeno_nota` | **P13b**: Desempeño general del personal auxiliar (1 a 5 o N/A) |
| **38** | `Auxiliar_Higiene_Orden_Nota` | `auxiliar_higiene_orden_nota` | **P13c**: Higiene y orden del espacio (1 a 5 o N/A) |
| **39** | `Auxiliar_Contencion_Nota` | `auxiliar_contencion_nota` | **P13d**: Trato afectuoso y contención (1 a 5 o N/A) |
| **40** | `Comentario_Mejora` | `comentario_mejora` | **P14**: Sugerencias y oportunidades de mejora abiertas |
| **41** | `NPS_Puntaje` | `nps_puntaje` | **P15**: Recomendación NPS (0 a 10) |
| **42** | `NPS_Categoria` | `nps_categoria` | Clasificación automática (`Promotor` / `Pasivo` / `Detractor`) |
| **43** | `Dispositivo` | `dispositivo` | `Mobile` / `Desktop` |

---

## 2. Puesta en Marcha en 3 Pasos

1. **Pegar Código en Apps Script:**
   - En tu Google Sheets, abre **Extensiones** $\rightarrow$ **Apps Script**.
   - Pega el código de [`backend/apps-script.gs`](file:///h:/Unidades%20compartidas/Direcci%C3%B3n%20de%20Estad%C3%ADstica%20%20%20GRCU/04_DASHBOARDS-Y-VISUALIZACIONES/04.1_Dashboards-OG-DataStudio/Infraestructura%20del%20Observatorio%20%28HTML%29/Proyectos%20Google%20Antigravity/Encuestas%20de%20Satisfacci%C3%B3n/backend/apps-script.gs).

2. **Inicializar Hojas:**
   - Selecciona la función `inicializarHojas` en la barra superior y pulsa **Ejecutar** (▶).
   - Otorga los permisos requeridos. Se crearán y formatearán las hojas «Salud» y «Educación» automáticamente.

3. **Implementar Web App:**
   - Haz clic en **Implementar** $\rightarrow$ **Nueva implementación** $\rightarrow$ **Aplicación web**.
   - **Ejecutar como:** *Yo (tu cuenta)*.
   - **Quién tiene acceso:** *Cualquier usuario* (Anyone).
   - Copia la URL resultante y colócala en `SCRIPT_URL` en los formularios y tableros.
