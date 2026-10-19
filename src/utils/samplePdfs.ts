import { jsPDF } from 'jspdf';
import { ProposalFile } from '../types/insurance';

function createPdfDataUri(
  title: string,
  docNumber: string,
  insurer: string,
  vehicle: string,
  primaAnual: string,
  rows: [string, string][]
): { name: string; base64: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header banner
  doc.setFillColor(15, 37, 66); // Navy blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(insurer.toUpperCase(), 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`COTIZACIÓN DE SEGURO VOLUNTARIO DE AUTOMÓVILES - COSTA RICA`, 14, 21);

  // Document details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Propuesta: ${docNumber} | Fecha de emisión: 19 de Octubre 2026`, 14, 44);
  doc.text(`Vehículo asegurado: ${vehicle}`, 14, 50);

  // Box for Prima Anual
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 55, 182, 18, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 37, 66);
  doc.text('PRIMA ANUAL TOTAL COTIZADA (Con Impuesto al Valor Agregado IVA):', 18, 63);
  doc.setFontSize(14);
  doc.setTextColor(16, 120, 60);
  doc.text(primaAnual, 18, 70);

  // Table header
  let y = 80;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RUBRO / COBERTURA', 18, y + 5.5);
  doc.text('CONDICIONES ESPECÍFICAS Y DEDUCIBLES', 85, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  rows.forEach(([rubro, detalle], index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 9, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 9, 196, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(rubro, 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitDetalle = doc.splitTextToSize(detalle, 105);
    doc.text(splitDetalle[0] || detalle, 85, y + 6);

    y += 9;
  });

  // Footer notes & legal text
  y += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Nota legal: Esta cotización es preliminar y está sujeta a las condiciones generales de la póliza registrada ante SUGESE.',
    14,
    y
  );
  doc.text('Válida por 30 días naturales a partir de la fecha de expedición.', 14, y + 5);

  const base64DataUri = doc.output('datauristring');
  // Strip "data:application/pdf;base64," prefix for Gemini
  const base64Pure = base64DataUri.split(',')[1] || '';

  return {
    name: `${insurer.replace(/\s+/g, '_')}_Propuesta_${docNumber}.pdf`,
    base64: base64Pure,
  };
}

export function generateSampleProposals(): ProposalFile[] {
  // 1. INS
  const ins = createPdfDataUri(
    'Propuesta Seguro Voluntario de Automóviles - INS',
    'INS-CR-8841',
    'Instituto Nacional de Seguros (INS)',
    'Toyota RAV4 2023 - Uso Particular',
    'CRC 620.000,00 anual',
    [
      ['Prima Anual', 'CRC 620.000 anual (incluye IVA 13%)'],
      ['Colisión y Vuelco', 'Deducible fijo de ₡150.000 en red autorizada INS'],
      ['Robo Total y Parcial', 'Deducible fijo de ₡150.000'],
      ['RC Daños a Terceros', '₡100.000.000 límite único combinado'],
      ['RC Lesiones o Muerte', '₡100.000.000 por evento'],
      ['Asistencia Vial 24/7', 'Multi-Asistencia INS 24/7 incluida sin límite de eventos'],
      ['Servicio de Grúa', 'Hasta 500 km anuales cubiertos a nivel nacional'],
      ['Vehículo Sustituto', 'Incluido por 15 días continuos en caso de colisión'],
      ['Fenómenos Naturales', 'Amparo total (sismo, inundación, tempestad) sin deducible'],
      ['Rotura de Cristales', '100% amparado sin deducible'],
      [
        'Exclusiones destacadas',
        'Conducción bajo efectos de licor, carreras ilegales, servicio pirata',
      ],
    ]
  );

  // 2. Quálitas
  const qualitas = createPdfDataUri(
    'Propuesta Póliza Auto Total - Quálitas Seguros',
    'QCR-AUTO-9430',
    'Quálitas Compañía de Seguros Costa Rica',
    'Toyota RAV4 2023 - Uso Particular',
    'CRC 540.000,00 anual',
    [
      ['Prima Anual', 'CRC 540.000 anual (incluye IVA 13%)'],
      ['Colisión y Vuelco', 'Deducible 25% del monto del daño con mínimo de ₡250.000'],
      ['Robo Total', 'Deducible 20% del valor comercial'],
      ['RC Daños a Terceros', '₡75.000.000'],
      ['RC Lesiones a Terceros', '₡75.000.000'],
      ['Asistencia Vial 24/7', 'Asistencia vial 24/7 básica (máximo 3 eventos al año)'],
      ['Servicio de Grúa', 'Hasta 200 km por evento (máximo 3 asistencias anuales)'],
      [
        'Vehículo Sustituto',
        'NO incluido en prima básica (opcional con costo adicional de ₡45.000/año)',
      ],
      ['Fenómenos Naturales', 'Incluido con deducible del 20%'],
      ['Rotura de Cristales', 'Cubierto con deducible del 10%'],
      [
        'Exclusiones destacadas',
        'Conducción sin licencia costarricense vigente, vías intransitables',
      ],
    ]
  );

  // 3. ASSA
  const assa = createPdfDataUri(
    'Propuesta Auto Fácil Premier - ASSA Compañía de Seguros',
    'ASSA-CR-5521',
    'ASSA Compañía de Seguros Costa Rica',
    'Toyota RAV4 2023 - Uso Particular',
    'CRC 690.000,00 anual',
    [
      ['Prima Anual', 'CRC 690.000 anual (incluye IVA 13%)'],
      ['Colisión y Vuelco', 'Deducible preferente fijo de ₡120.000 en Red Premier'],
      ['Robo Total y Parcial', 'Cero deducible (0%) con dispositivo GPS activo'],
      ['RC Daños a Terceros', '₡150.000.000'],
      ['RC Lesiones a Terceros', '₡150.000.000'],
      ['Asistencia Vial 24/7', 'ASSA Móvil VIP 24/7 sin límite de eventos'],
      ['Servicio de Grúa', 'Grúa ilimitada en GAM y hasta 350 km fuera de GAM'],
      ['Vehículo Sustituto', 'Incluido por 20 días en categoría SUV similar'],
      ['Fenómenos Naturales', 'Amparo total con cero deducible en inundación o sismo'],
      ['Rotura de Cristales', '100% amparado sin deducible'],
      [
        'Exclusiones destacadas',
        'Dolo del asegurado, sobrecarga de pasajeros, daños por desgaste',
      ],
    ]
  );

  return [
    {
      id: 'sample-ins',
      name: ins.name,
      size: 48200,
      base64: ins.base64,
      source: 'sample',
      insurerGuess: 'INS',
    },
    {
      id: 'sample-qualitas',
      name: qualitas.name,
      size: 47600,
      base64: qualitas.base64,
      source: 'sample',
      insurerGuess: 'Quálitas',
    },
    {
      id: 'sample-assa',
      name: assa.name,
      size: 48900,
      base64: assa.base64,
      source: 'sample',
      insurerGuess: 'ASSA',
    },
  ];
}
