import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Shield,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ProposalComparison } from '../types/insurance';

interface Props {
  proposals: ProposalComparison[];
  recommendedInsurer: string;
}

export const ComparisonTable: React.FC<Props> = ({ proposals, recommendedInsurer }) => {
  if (!proposals || proposals.length === 0) {
    return null;
  }

  // Row definition in the exact required order:
  // 1. Prima anual
  // 2. Cabe en presupuesto
  // 3. Deducible colisión
  // 4. Deducible robo
  // 5. RC daños a terceros
  // 6. RC lesiones
  // 7. Asistencia vial 24/7
  // 8. Grúa
  // 9. Vehículo sustituto
  // 10. Fenómenos naturales
  // 11. Rotura de cristales
  // 12. Exclusiones destacadas
  // 13. Cumple obligatorias
  // 14. Semáforo

  const renderSemaphoroBadge = (semaforo: string, razon?: string) => {
    const s = semaforo?.toLowerCase() || '';
    if (s === 'verde') {
      return (
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            VERDE
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 text-center">
            {razon || 'Cabe en presupuesto y cumple todas las coberturas'}
          </span>
        </div>
      );
    }
    if (s === 'amarillo') {
      return (
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
            AMARILLO
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 text-center">
            {razon || 'Cumple coberturas pero supera el presupuesto'}
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span>
          ROJO
        </span>
        <span className="text-[11px] text-rose-700 font-medium mt-1 text-center">
          {razon || 'No cumple con las coberturas obligatorias exigidas'}
        </span>
      </div>
    );
  };

  const renderBooleanBadge = (val: boolean | 'no indicado', detail?: string) => {
    if (val === true) {
      return (
        <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sí {detail ? `(${detail})` : ''}</span>
        </div>
      );
    }
    if (val === false) {
      return (
        <div className="flex items-center space-x-1.5 text-rose-700 font-semibold text-xs">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>No {detail ? `(${detail})` : ''}</span>
        </div>
      );
    }
    return <span className="text-slate-400 italic text-xs">no indicado</span>;
  };

  const rows = [
    {
      id: 'primaAnual',
      label: '1. Prima anual',
      isHighlight: true,
      render: (p: ProposalComparison) => (
        <div className="font-bold text-slate-900 text-sm sm:text-base">
          {p.primaAnual || 'no indicado'}
        </div>
      ),
    },
    {
      id: 'cabeEnPresupuesto',
      label: '2. Cabe en presupuesto',
      render: (p: ProposalComparison) =>
        renderBooleanBadge(p.cabeEnPresupuesto, p.cabeEnPresupuestoDetalle),
    },
    {
      id: 'deducibleColision',
      label: '3. Deducible colisión',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.deducibleColision || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'deducibleRobo',
      label: '4. Deducible robo',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.deducibleRobo || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'rcDanosTerceros',
      label: '5. RC daños a terceros',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.rcDanosTerceros || 'no indicado'}</span>
      ),
    },
    {
      id: 'rcLesiones',
      label: '6. RC lesiones',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.rcLesiones || 'no indicado'}</span>
      ),
    },
    {
      id: 'asistenciaVial',
      label: '7. Asistencia vial 24/7',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.asistenciaVial || 'no indicado'}</span>
      ),
    },
    {
      id: 'grua',
      label: '8. Grúa',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.grua || 'no indicado'}</span>
      ),
    },
    {
      id: 'vehiculoSustituto',
      label: '9. Vehículo sustituto',
      render: (p: ProposalComparison) => (
        <span
          className={`text-xs ${
            p.vehiculoSustituto?.toLowerCase().includes('no') ||
            p.vehiculoSustituto?.toLowerCase().includes('opcional')
              ? 'text-amber-800 font-medium bg-amber-50 p-1 rounded'
              : 'text-slate-700'
          }`}
        >
          {p.vehiculoSustituto || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'fenomenosNaturales',
      label: '10. Fenómenos naturales',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.fenomenosNaturales || 'no indicado'}</span>
      ),
    },
    {
      id: 'roturaCristales',
      label: '11. Rotura de cristales',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-700">{p.roturaCristales || 'no indicado'}</span>
      ),
    },
    {
      id: 'exclusionesDestacadas',
      label: '12. Exclusiones destacadas',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-600 block line-clamp-3 hover:line-clamp-none transition-all">
          {p.exclusionesDestacadas || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'cumpleObligatorias',
      label: '13. Cumple obligatorias',
      isHighlight: true,
      render: (p: ProposalComparison) =>
        renderBooleanBadge(p.cumpleObligatorias, p.cumpleObligatoriasDetalle),
    },
    {
      id: 'semaforo',
      label: '14. Semáforo',
      isHighlight: true,
      render: (p: ProposalComparison) =>
        renderSemaphoroBadge(p.semaforo, p.semaforoRazon),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A2540] text-white text-xs font-bold">
            3
          </span>
          <h2 className="text-lg font-bold text-slate-800">Resultado: Tabla Comparativa</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {proposals.length} propuesta{proposals.length > 1 ? 's' : ''} analizada{proposals.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-[#0A2540] text-white">
              <th className="p-3.5 sm:p-4 text-xs font-semibold tracking-wider uppercase text-blue-200 w-1/4 min-w-[170px] border-r border-blue-900/60 sticky left-0 bg-[#0A2540] z-10 shadow-r">
                Parámetro / Aseguradora
              </th>
              {proposals.map((proposal, idx) => {
                const isRecommended =
                  recommendedInsurer &&
                  proposal.insurerName.toLowerCase().includes(recommendedInsurer.toLowerCase());

                return (
                  <th
                    key={idx}
                    className={`p-3.5 sm:p-4 text-center align-top border-r border-blue-900/60 last:border-r-0 relative transition-all ${
                      isRecommended ? 'bg-[#0F3A66]' : ''
                    }`}
                    style={{ width: `${75 / proposals.length}%` }}
                  >
                    {isRecommended && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider mb-1.5 shadow-2xs">
                        <Award className="w-3 h-3" />
                        <span>Recomendada en borrador</span>
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {proposal.insurerName}
                    </h3>
                    <p className="text-[11px] text-blue-200/80 truncate max-w-[200px] mx-auto mt-0.5" title={proposal.documentName}>
                      {proposal.documentName}
                    </p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rowIndex) => {
              const isEven = rowIndex % 2 === 0;
              return (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-blue-50/30 ${
                    row.isHighlight
                      ? 'bg-amber-50/20 font-medium'
                      : isEven
                      ? 'bg-slate-50/60'
                      : 'bg-white'
                  }`}
                >
                  <td className="p-3 sm:p-3.5 text-xs font-semibold text-slate-800 border-r border-slate-200 sticky left-0 bg-inherit z-10 shadow-r">
                    {row.label}
                  </td>
                  {proposals.map((proposal, colIndex) => {
                    const isRecommended =
                      recommendedInsurer &&
                      proposal.insurerName.toLowerCase().includes(recommendedInsurer.toLowerCase());

                    return (
                      <td
                        key={colIndex}
                        className={`p-3 sm:p-3.5 text-center align-middle border-r border-slate-200 last:border-r-0 ${
                          isRecommended ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        {row.render(proposal)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Verde: Cabe y cumple</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Amarillo: Cumple pero no cabe</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Rojo: No cumple obligatorias</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Valores extraídos estrictamente de los documentos PDF presentados.
        </span>
      </div>
    </div>
  );
};
