export interface ClientProfile {
  clientName: string;
  vehicleAndUsage: string;
  maxBudgetColones: number;
  mandatoryCoverages: {
    colision: boolean;
    robo: boolean;
    asistenciaVial: boolean;
    fenomenosNaturales: boolean;
    vehiculoSustituto: boolean;
  };
  priorities: string;
  paymentMethod: string;
}

export interface ProposalFile {
  id: string;
  name: string;
  size: number;
  base64: string; // base64 encoded PDF string (without data:application/pdf;base64, prefix or with it)
  source?: 'upload' | 'sample';
  insurerGuess?: string;
}

export interface ProposalComparison {
  insurerName: string;
  documentName: string;
  primaAnual: string; // Formatted string, e.g. "₡620,000" or "no indicado"
  primaAnualMonto: number | null; // Raw numeric value for math or null if not indicated
  cabeEnPresupuesto: boolean | 'no indicado';
  cabeEnPresupuestoDetalle: string;
  deducibleColision: string;
  deducibleRobo: string;
  rcDanosTerceros: string;
  rcLesiones: string;
  asistenciaVial: string;
  grua: string;
  vehiculoSustituto: string;
  fenomenosNaturales: string;
  roturaCristales: string;
  exclusionesDestacadas: string;
  cumpleObligatorias: boolean | 'no indicado';
  cumpleObligatoriasDetalle: string;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  semaforoRazon: string;
}

export interface ComparisonResponse {
  proposals: ProposalComparison[];
  recomendacionPreliminar: string; // Max 5 lines
  propuestaRecomendada: string;
  mensajeWhatsApp: string; // Max 8 lines
  fechaAnalisis: string;
}
