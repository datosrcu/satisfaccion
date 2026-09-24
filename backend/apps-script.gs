/**
 * =========================================================================================
 * SISTEMA INTEGRAL DE SATISFACCIÓN CIUDADANA - MUNICIPALIDAD DE RÍO CUARTO
 * Base de Datos Centralizada y API REST en Google Apps Script
 * Hojas: «Salud» (Efectores de Salud) y «Educación» (Jardines Maternales y Salas Cuna)
 * =========================================================================================
 * 
 * Instrucciones de Configuración y Puesta en Marcha:
 * 1. Abre el Google Sheet de destino (ej. "BD_Encuestas_Satisfaccion_GRCU").
 * 2. Ve al menú superior: Extensiones -> Apps Script.
 * 3. Reemplaza todo el código del editor por este archivo completo.
 * 4. En el menú desplegable superior, selecciona la función "inicializarHojas" y haz clic en "Ejecutar" (▶).
 *    (Esto creará y formateará automáticamente las pestañas «Salud» y «Educación» con sus encabezados y estilos institucionales).
 * 5. Haz clic en el botón azul superior "Implementar" -> "Nueva implementación".
 * 6. Configura:
 *    - Tipo: "Aplicación web"
 *    - Descripción: "API Encuestas de Satisfaccion GRCU v2.0"
 *    - Ejecutar como: "Yo (tu cuenta de correo)"
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) -> Clave para que los vecinos respondan sin iniciar sesión.
 * 7. Copia la URL de la aplicación web generada (ej. https://script.google.com/macros/s/.../exec)
 *    y pégala en la variable SCRIPT_URL de los formularios y tableros.
 */

// Nombres oficiales de las pestañas
const NOMBRE_HOJA_SALUD = "Salud";
const NOMBRE_HOJA_EDUCACION = "Educación";

// Encabezados oficiales para la hoja «Salud» (18 Columnas)
const HEADERS_SALUD = [
  "ID",
  "Fecha_Hora",
  "Centro_ID",
  "Centro_Nombre",
  "Tipo_Centro",
  "Barrio",
  "Llegada",
  "Especialidad",
  "Profesional",
  "Recepcion_Nota",
  "Espera_Nota",
  "Infraestructura_Nota",
  "Enfermeria_Nota",
  "Medico_Nota",
  "NPS_Puntaje",
  "NPS_Categoria",
  "Sugerencias",
  "Dispositivo"
];

// Encabezados oficiales para la hoja «Educación» (43 Columnas)
const HEADERS_EDUCACION = [
  // Bloque 1: Identificación y Datos Generales
  "ID",
  "Fecha_Hora",
  "Institucion_ID",
  "Institucion_Nombre",
  "Tipo_Institucion",
  "Barrio",
  "Turno",
  "Sala",
  "Tiempo_Asistencia",
  
  // Bloque 2: Atención y Organización Institucional (P3–P7)
  "Atencion_Inscripcion_Nota",
  "Horarios_Organizacion_Nota",
  "Ingreso_Egreso_Nota",
  "Normas_Claras_Nota",
  "Respuesta_Institucional_Nota",
  
  // Bloque 3: Infraestructura, Limpieza y Condiciones Generales (P8–P11)
  "Infraestructura_Instalaciones_Nota",
  "Seguridad_Espacio_Nota",
  "Materiales_Recursos_Nota",
  "Limpieza_Espacio_Nota",
  
  // Bloque 4: Desempeño y Rol Docente (P12a–P12q)
  "Docente_Nombre",
  "Docente_Info_Actividades_Nota",
  "Docente_Canales_Adecuados_Nota",
  "Docente_Info_Clara_Nota",
  "Docente_Espacios_Escucha_Nota",
  "Docente_Comunicacion_Fluida_Nota",
  "Docente_Sentirse_Escuchado_Nota",
  "Docente_Vinculo_Nino_Nota",
  "Docente_Contencion_Nota",
  "Docente_Conoce_Particularidades_Nota",
  "Docente_Tranquilidad_Confianza_Nota",
  "Docente_Trato_Afectuoso_Nota",
  "Docente_Atencion_Necesidades_Nota",
  "Docente_Ambiente_Seguro_Nota",
  "Docente_Propuestas_Adecuadas_Nota",
  "Docente_Experiencias_Juego_Nota",
  "Docente_Variedad_Propuestas_Nota",
  
  // Bloque 5: Desempeño del Personal Auxiliar (P13a–P13d)
  "Auxiliar_Nombre",
  "Auxiliar_Desempeno_Nota",
  "Auxiliar_Higiene_Orden_Nota",
  "Auxiliar_Contencion_Nota",
  
  // Bloque 6: Comentarios Abiertos (P14)
  "Comentario_Mejora",
  
  // Bloque 7: Recomendación NPS (P15)
  "NPS_Puntaje",
  "NPS_Categoria",
  
  // Metadatos Técnicos
  "Dispositivo"
];

/**
 * Endpoint POST: Recibe y almacena de forma concurrente las respuestas de Salud y Educación
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Bloqueo concurrente de hasta 30s para evitar condiciones de carrera
    lock.waitLock(30000);

    let params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    const tipo = (params.tipo_encuesta || params.survey_type || "salud").toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, "America/Argentina/Cordoba", "yyyy-MM-dd HH:mm:ss");

    // ==========================================
    // 1. REGISTRO DE SALUD MUNICIPAL
    // ==========================================
    if (tipo === "salud" || tipo === "health" || tipo === "caps") {
      const sheet = getOrCreateSheet(ss, NOMBRE_HOJA_SALUD, HEADERS_SALUD, "#009DE0");
      const uniqueId = "SAL-" + Utilities.formatDate(now, "America/Argentina/Cordoba", "yyyyMMdd-HHmmss") + "-" + Math.floor(100 + Math.random() * 900);

      const npsNum = params.nps_puntaje !== undefined && params.nps_puntaje !== "" ? Number(params.nps_puntaje) : "";
      let npsCat = "";
      if (npsNum !== "") {
        if (npsNum >= 9) npsCat = "Promotor";
        else if (npsNum >= 7) npsCat = "Pasivo";
        else npsCat = "Detractor";
      }

      const row = [
        uniqueId,
        formattedDate,
        params.centro_id || "",
        params.centro_nombre || "",
        params.tipo_centro || "",
        params.barrio || "",
        params.llegada || "",
        params.especialidad || "",
        params.profesional || "Profesional de Turno",
        params.recepcion_nota || "",
        params.espera_nota || "",
        params.infraestructura_nota || "",
        params.enfermeria_nota || "No aplica",
        params.medico_nota || "No aplica",
        npsNum,
        npsCat,
        params.sugerencias || "",
        params.dispositivo || "Web/Mobile"
      ];

      sheet.appendRow(row);

      return jsonOutput({
        status: "success",
        message: "Respuesta de salud registrada correctamente",
        id: uniqueId,
        hoja: NOMBRE_HOJA_SALUD,
        tipo: "salud"
      });

    // ==========================================
    // 2. REGISTRO DE EDUCACIÓN MUNICIPAL
    // ==========================================
    } else if (tipo === "educacion" || tipo === "education" || tipo === "salas_cuna" || tipo === "jardines") {
      const sheet = getOrCreateSheet(ss, NOMBRE_HOJA_EDUCACION, HEADERS_EDUCACION, "#00C96B");
      const uniqueId = "EDU-" + Utilities.formatDate(now, "America/Argentina/Cordoba", "yyyyMMdd-HHmmss") + "-" + Math.floor(100 + Math.random() * 900);

      const npsNum = params.nps_puntaje !== undefined && params.nps_puntaje !== "" ? Number(params.nps_puntaje) : "";
      let npsCat = "";
      if (npsNum !== "") {
        if (npsNum >= 9) npsCat = "Promotor";
        else if (npsNum >= 7) npsCat = "Pasivo";
        else npsCat = "Detractor";
      }

      const row = [
        uniqueId,
        formattedDate,
        params.institucion_id || "",
        params.institucion_nombre || "",
        params.tipo_institucion || "",
        params.barrio || "",
        params.turno || params.turno_asignado || "",
        params.sala || params.sala_espacio || "",
        params.tiempo_asistencia || "",
        
        // Bloque 2: P3–P7
        params.atencion_inscripcion_nota || "",
        params.horarios_organizacion_nota || "",
        params.ingreso_egreso_nota || "",
        params.normas_claras_nota || "",
        params.respuesta_institucional_nota || "",
        
        // Bloque 3: P8–P11
        params.infraestructura_instalaciones_nota || "",
        params.seguridad_espacio_nota || "",
        params.materiales_recursos_nota || "",
        params.limpieza_espacio_nota || "",
        
        // Bloque 4: P12a–P12q
        params.docente_nombre || "",
        params.docente_info_actividades_nota || "",
        params.docente_canales_adecuados_nota || "",
        params.docente_info_clara_nota || "",
        params.docente_espacios_escucha_nota || "",
        params.docente_comunicacion_fluida_nota || "",
        params.docente_sentirse_escuchado_nota || "",
        params.docente_vinculo_nino_nota || "",
        params.docente_contencion_nota || "",
        params.docente_conoce_particularidades_nota || "",
        params.docente_tranquilidad_confianza_nota || "",
        params.docente_trato_afectuoso_nota || "",
        params.docente_atencion_necesidades_nota || "",
        params.docente_ambiente_seguro_nota || "",
        params.docente_propuestas_adecuadas_nota || "",
        params.docente_experiencias_juego_nota || "",
        params.docente_variedad_propuestas_nota || "",
        
        // Bloque 5: P13a–P13d
        params.auxiliar_nombre || "",
        params.auxiliar_desempeno_nota || "",
        params.auxiliar_higiene_orden_nota || "",
        params.auxiliar_contencion_nota || "",
        
        // Bloque 6: P14
        params.comentario_mejora || params.sugerencias_mejora || "",
        
        // Bloque 7: P15
        npsNum,
        npsCat,
        
        params.dispositivo || "Web/Mobile"
      ];

      sheet.appendRow(row);

      return jsonOutput({
        status: "success",
        message: "Respuesta de educación registrada correctamente",
        id: uniqueId,
        hoja: NOMBRE_HOJA_EDUCACION,
        tipo: "educacion"
      });

    } else {
      return jsonOutput({
        status: "error",
        message: "Tipo de encuesta no reconocido: " + tipo
      });
    }

  } catch (error) {
    return jsonOutput({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Endpoint GET: Entrega los registros estructurados en tiempo real para alimentar los Tableros de Control
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = (params.action || params.tipo || params.hoja || "info").toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Datos para Tablero de Salud
    if (action === "get_health" || action === "salud" || action === "health") {
      let sheet = ss.getSheetByName(NOMBRE_HOJA_SALUD) || ss.getSheetByName("Respuestas_Salud");
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonOutput([]);
      }
      const data = getSheetObjects(sheet);
      return jsonOutput(data);

    // 2. Datos para Tablero de Educación
    } else if (action === "get_education" || action === "educacion" || action === "education" || action === "salas_cuna") {
      let sheet = ss.getSheetByName(NOMBRE_HOJA_EDUCACION) || ss.getSheetByName("Educacion") || ss.getSheetByName("Respuestas_Educacion");
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonOutput([]);
      }
      const data = getSheetObjects(sheet);
      return jsonOutput(data);

    // 3. Catálogos opcionales almacenados
    } else if (action === "get_catalogs" || action === "catalogos") {
      const sheet = ss.getSheetByName("Catalogos");
      if (sheet && sheet.getLastRow() >= 1) {
        const rawJson = sheet.getRange(1, 1).getValue();
        if (rawJson) {
          try {
            return jsonOutput(JSON.parse(rawJson));
          } catch(e) {}
        }
      }
      return jsonOutput({ status: "catalogo_default_ready" });

    // 4. Panel de Estado y Metadatos de la BBDD
    } else {
      const sSalud = ss.getSheetByName(NOMBRE_HOJA_SALUD) || ss.getSheetByName("Respuestas_Salud");
      const sEdu = ss.getSheetByName(NOMBRE_HOJA_EDUCACION) || ss.getSheetByName("Educacion") || ss.getSheetByName("Respuestas_Educacion");

      const countSalud = sSalud && sSalud.getLastRow() > 1 ? sSalud.getLastRow() - 1 : 0;
      const countEdu = sEdu && sEdu.getLastRow() > 1 ? sEdu.getLastRow() - 1 : 0;

      return jsonOutput({
        sistema: "Base de Datos de Satisfacción Ciudadana · Municipalidad de Río Cuarto",
        version: "2.0",
        fecha_consulta: new Date().toISOString(),
        hojas: {
          salud: {
            nombre: NOMBRE_HOJA_SALUD,
            columnas: HEADERS_SALUD.length,
            total_respuestas: countSalud
          },
          educacion: {
            nombre: NOMBRE_HOJA_EDUCACION,
            columnas: HEADERS_EDUCACION.length,
            total_respuestas: countEdu
          }
        },
        endpoints_tableros: [
          "?action=get_health",
          "?action=get_education",
          "?action=get_catalogs"
        ]
      });
    }

  } catch (err) {
    return jsonOutput({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Transforma las filas de una hoja en un arreglo de objetos JSON estructurados y limpios
 */
function getSheetObjects(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
  const headers = values[0].map(h => cleanHeaderKey(h));
  const results = [];

  for (let r = 1; r < values.length; r++) {
    const rowObj = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      const val = values[r][c];
      if (val !== "") hasData = true;
      rowObj[key] = val;
    }
    if (hasData) {
      results.push(rowObj);
    }
  }
  return results;
}

/**
 * Normaliza los nombres de encabezados para convertirlos en identificadores estándar (ej: "Fecha_Hora" -> "fecha_hora")
 */
function cleanHeaderKey(header) {
  return header
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, '_')
    .replace(/[áäà]/g, 'a')
    .replace(/[éëè]/g, 'e')
    .replace(/[íïì]/g, 'i')
    .replace(/[óöò]/g, 'o')
    .replace(/[úüù]/g, 'u')
    .replace(/ñ/g, 'n');
}

/**
 * Obtiene una hoja existente o la crea con encabezados y formato institucional aplicado
 */
function getOrCreateSheet(ss, sheetName, headers, primaryColor) {
  let sheet = ss.getSheetByName(sheetName);
  
  // Soporte de alias en caso de nombres previos
  if (!sheet) {
    if (sheetName === NOMBRE_HOJA_EDUCACION) {
      sheet = ss.getSheetByName("Educacion") || ss.getSheetByName("Respuestas_Educacion");
    } else if (sheetName === NOMBRE_HOJA_SALUD) {
      sheet = ss.getSheetByName("Respuestas_Salud");
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Aplicar estilos institucionales a los encabezados
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(primaryColor || "#009DE0");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Inter");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    headerRange.setWrap(true);
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    // Ajustar anchos iniciales
    for (let c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
  return sheet;
}

/**
 * Salida JSON con configuración CORS
 */
function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================================
 * INICIALIZADOR DE HOJAS Y FORMATOS (Ejecutar una vez desde Apps Script)
 * =========================================================================================
 */
function inicializarHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Hoja «Salud»
  const sSalud = getOrCreateSheet(ss, NOMBRE_HOJA_SALUD, HEADERS_SALUD, "#009DE0");
  sSalud.setName(NOMBRE_HOJA_SALUD);
  sSalud.setTabColor("#009DE0");

  // 2. Hoja «Educación»
  const sEdu = getOrCreateSheet(ss, NOMBRE_HOJA_EDUCACION, HEADERS_EDUCACION, "#00C96B");
  sEdu.setName(NOMBRE_HOJA_EDUCACION);
  sEdu.setTabColor("#00C96B");

  // 3. Hoja opcional de Catálogos / Configuración
  let sCat = ss.getSheetByName("Catalogos");
  if (!sCat) {
    sCat = ss.insertSheet("Catalogos");
    sCat.getRange(1, 1).setValue("Configuracion_JSON");
    sCat.getRange(1, 1).setBackground("#00618A").setFontColor("#FFF").setFontWeight("bold");
    sCat.setTabColor("#5B6470");
  }

  SpreadsheetApp.flush();
  Logger.log("✅ Hojas «" + NOMBRE_HOJA_SALUD + "» y «" + NOMBRE_HOJA_EDUCACION + "» inicializadas con éxito.");
}
