import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Increase payload limits for PDF base64 payloads (up to 3 files)
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API endpoint for comparison with hardened validation
  app.post('/api/compare', async (req, res) => {
    try {
      const { files, profile } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos 1 archivo PDF de propuesta.' });
      }

      if (files.length > 3) {
        return res.status(400).json({ error: 'Máximo 3 propuestas por comparación.' });
      }

      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || typeof file.base64 !== 'string' || file.base64.length === 0) {
          return res.status(400).json({ error: `El archivo ${i + 1} no tiene un contenido válido.` });
        }
        // Base64 size check: 10MB limit (~13.3MB base64 string)
        if (file.base64.length > 14 * 1024 * 1024) {
          return res.status(400).json({ error: `El archivo "${file.name || i + 1}" excede el límite de 10MB.` });
        }
      }

      if (!profile || !profile.clientName || typeof profile.clientName !== 'string') {
        return res.status(400).json({ error: 'El nombre del cliente es requerido.' });
      }

      // Sanitize inputs
      const sanitizedClientName = profile.clientName.trim().substring(0, 120);
      const sanitizedVehicle = (profile.vehicleAndUsage || '').trim().substring(0, 200);
      const sanitizedPriorities = (profile.priorities || '').trim().substring(0, 600);
      const budgetNum = Number(profile.maxBudgetColones);
      if (isNaN(budgetNum) || budgetNum < 0) {
        return res.status(400).json({ error: 'El presupuesto debe ser un número positivo en colones.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY no encontrada en las variables de entorno.');
        return res.status(500).json({
          error: 'No se ha configurado la clave GEMINI_API_KEY en las variables de entorno.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Prepare multimodal parts with PDF files
      const parts: any[] = [];

      files.forEach((file: { name: string; base64: string }, index: number) => {
        const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        });
      });

      const mandatoryList: string[] = [];
      if (profile.mandatoryCoverages?.colision) mandatoryList.push('Colisión (Daño propio / colisión y vuelco)');
      if (profile.mandatoryCoverages?.robo) mandatoryList.push('Robo (Total y parcial)');
      if (profile.mandatoryCoverages?.asistenciaVial) mandatoryList.push('Asistencia vial 24/7');
      if (profile.mandatoryCoverages?.fenomenosNaturales) mandatoryList.push('Fenómenos naturales (Inundación, sismo, erupción)');
      if (profile.mandatoryCoverages?.vehiculoSustituto) mandatoryList.push('Vehículo sustituto');

      const promptText = `
Eres el motor de análisis experto de "Comparador de Propuestas BN", para una corredora de seguros en Costa Rica.
Se te han suministrado ${files.length} documento(s) PDF con cotizaciones/propuestas de seguros de automóvil.
Los nombres de los archivos enviados son:
${files.map((f: { name: string }, i: number) => `Documento ${i + 1}: "${f.name}"`).join('\n')}

PERFIL DEL CLIENTE:
- Nombre: ${profile.clientName}
- Vehículo y uso: ${profile.vehicleAndUsage || 'No indicado'}
- Presupuesto máximo anual (en colones costarricenses CRC / ₡): ₡${Number(profile.maxBudgetColones || 0).toLocaleString('es-CR')}
- Coberturas obligatorias marcadas por el cliente:
  ${mandatoryList.length > 0 ? mandatoryList.map(c => `* ${c}`).join('\n  ') : '* Ninguna cobertura obligatoria seleccionada'}
- Prioridades del cliente: ${profile.priorities || 'Equilibrio costo/cobertura'}
- Forma de pago preferida: ${profile.paymentMethod || 'Anual de contado'}

LÓGICA ESTRICTA (REGLAS OBLIGATORIAS):
1. Extraer de cada PDF solo lo que dice el documento; si un dato no aparece, escribir "no indicado". No inventar nada.
2. Validar:
   - CABE EN PRESUPUESTO: true si la prima anual cotizada es menor o igual al presupuesto del cliente (₡${profile.maxBudgetColones}). Si excede el presupuesto o no está indicada, es false.
   - CUMPLE OBLIGATORIAS: true SOLO SI TODAS las coberturas marcadas como obligatorias están efectivamente incluidas en la prima básica del seguro; un paquete opcional con costo adicional NO cuenta como incluido.
3. Semáforo para cada aseguradora:
   - "verde": si cabe en presupuesto y cumple obligatorias.
   - "amarillo": si cumple obligatorias pero NO cabe en presupuesto.
   - "rojo": si NO cumple obligatorias (independientemente del presupuesto).
4. Recomendación preliminar (borrador):
   - Recomienda una sola propuesta.
   - Justificada en MÁXIMO 5 LÍNEAS con los montos exactos, según las prioridades del cliente.
   - REGLA CLAVE: Si una propuesta amarilla es mejor en las prioridades que las verdes, indícalo expresamente y cuantifica la diferencia exacta de prima anual.
5. Mensaje sugerido para el cliente (WhatsApp):
   - Formato para WhatsApp, MÁXIMO 8 LÍNEAS.
   - Tono cordial, profesional, sin tecnicismos complejos.
   - Debe contener: la recomendación elegida, dos razones concretas, la alternativa disponible y un próximo paso.
   - REGLA CLAVE: Sin prometer plazos ni tiempos de entrega de póliza.

Devuelve la información estrictamente en el formato JSON estructurado solicitado.
`;

      parts.push({ text: promptText });

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          proposals: {
            type: Type.ARRAY,
            description: 'Lista de análisis comparativo para cada PDF enviado',
            items: {
              type: Type.OBJECT,
              properties: {
                insurerName: {
                  type: Type.STRING,
                  description: 'Nombre de la aseguradora (ej: INS, Quálitas, ASSA, Mapfre, etc.)',
                },
                documentName: {
                  type: Type.STRING,
                  description: 'Nombre del archivo o cotización',
                },
                primaAnual: {
                  type: Type.STRING,
                  description: 'Prima anual con símbolo de colones (ej: ₡620.000) o "no indicado"',
                },
                primaAnualMonto: {
                  type: Type.NUMBER,
                  description: 'Monto numérico exacto de la prima anual o 0 si no indicado',
                },
                cabeEnPresupuesto: {
                  type: Type.BOOLEAN,
                  description: 'True si es menor o igual al presupuesto',
                },
                cabeEnPresupuestoDetalle: {
                  type: Type.STRING,
                  description: 'Detalle breve de la comparación de presupuesto',
                },
                deducibleColision: {
                  type: Type.STRING,
                  description: 'Monto o porcentaje del deducible de colisión o "no indicado"',
                },
                deducibleRobo: {
                  type: Type.STRING,
                  description: 'Monto o porcentaje del deducible de robo o "no indicado"',
                },
                rcDanosTerceros: {
                  type: Type.STRING,
                  description: 'Límite o suma asegurada de Responsabilidad Civil daños materiales a terceros o "no indicado"',
                },
                rcLesiones: {
                  type: Type.STRING,
                  description: 'Límite o suma asegurada de RC lesiones y muerte a personas o "no indicado"',
                },
                asistenciaVial: {
                  type: Type.STRING,
                  description: 'Condiciones de Asistencia vial 24/7 o "no indicado"',
                },
                grua: {
                  type: Type.STRING,
                  description: 'Condiciones de servicio de grúa (kilometraje, eventos) o "no indicado"',
                },
                vehiculoSustituto: {
                  type: Type.STRING,
                  description: 'Días y condiciones de vehículo sustituto, o indicar si tiene costo adicional u opcional, o "no indicado"',
                },
                fenomenosNaturales: {
                  type: Type.STRING,
                  description: 'Cobertura de fenómenos naturales y deducible o "no indicado"',
                },
                roturaCristales: {
                  type: Type.STRING,
                  description: 'Condiciones de rotura de cristales o "no indicado"',
                },
                exclusionesDestacadas: {
                  type: Type.STRING,
                  description: 'Principales exclusiones señaladas en el documento o "no indicado"',
                },
                cumpleObligatorias: {
                  type: Type.BOOLEAN,
                  description: 'True si todas las coberturas obligatorias marcadas están incluidas en la prima básica',
                },
                cumpleObligatoriasDetalle: {
                  type: Type.STRING,
                  description: 'Explicación concisa de si cumple o qué cobertura falta',
                },
                semaforo: {
                  type: Type.STRING,
                  description: '"verde", "amarillo", o "rojo" según las reglas',
                },
                semaforoRazon: {
                  type: Type.STRING,
                  description: 'Motivo del color de semáforo',
                },
              },
              required: [
                'insurerName',
                'documentName',
                'primaAnual',
                'cabeEnPresupuesto',
                'deducibleColision',
                'deducibleRobo',
                'rcDanosTerceros',
                'rcLesiones',
                'asistenciaVial',
                'grua',
                'vehiculoSustituto',
                'fenomenosNaturales',
                'roturaCristales',
                'exclusionesDestacadas',
                'cumpleObligatorias',
                'semaforo',
              ],
            },
          },
          recomendacionPreliminar: {
            type: Type.STRING,
            description: 'Recomendación preliminar justificada en máximo 5 líneas con los montos según prioridades',
          },
          propuestaRecomendada: {
            type: Type.STRING,
            description: 'Nombre de la aseguradora recomendada',
          },
          mensajeWhatsApp: {
            type: Type.STRING,
            description: 'Mensaje cordial para el cliente en WhatsApp de máximo 8 líneas, con recomendación, 2 razones, alternativa y próximo paso. Sin plazos.',
          },
        },
        required: [
          'proposals',
          'recomendacionPreliminar',
          'propuestaRecomendada',
          'mensajeWhatsApp',
        ],
      };

      const result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction:
            'Eres un perito y analista técnico de seguros de automóviles en Costa Rica para "Comparador de Propuestas BN". Analiza con absoluta rigurosidad técnica los documentos PDF presentados. No inventes datos que no figuren en los contratos o cotizaciones. Si algo no aparece, pon "no indicado". Respeta estrictamente las reglas de semáforo (verde=cabe y cumple, amarillo=cumple pero excede presupuesto, rojo=no cumple obligatorias o paquete con cobro extra).',
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error('Gemini no retornó contenido.');
      }

      const parsedData = JSON.parse(responseText);
      parsedData.fechaAnalisis = new Date().toLocaleString('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error al procesar propuestas con Gemini:', error);
      return res.status(500).json({
        error: error.message || 'Error interno al analizar los documentos PDF con Gemini.',
      });
    }
  });

  // Setup Vite in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
