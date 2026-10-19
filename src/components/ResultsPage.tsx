import React from 'react';
import { ComparisonResponse, ClientProfile, ProposalFile } from '../types/insurance';
import { ComparisonTable } from './ComparisonTable';
import { ResultCards } from './ResultCards';
import {
  ArrowLeft,
  Home,
  User,
  Car,
  DollarSign,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface Props {
  result: ComparisonResponse;
  profile: ClientProfile;
  files: ProposalFile[];
  onBackToHome: () => void;
  onNewComparison: () => void;
}

export const ResultsPage: React.FC<Props> = ({
  result,
  profile,
  files,
  onBackToHome,
  onNewComparison,
}) => {
  const activeMandatoryList = [];
  if (profile.mandatoryCoverages.colision) activeMandatoryList.push('Colisión');
  if (profile.mandatoryCoverages.robo) activeMandatoryList.push('Robo');
  if (profile.mandatoryCoverages.asistenciaVial) activeMandatoryList.push('Asistencia vial 24/7');
  if (profile.mandatoryCoverages.fenomenosNaturales) activeMandatoryList.push('Fenómenos naturales');
  if (profile.mandatoryCoverages.vehiculoSustituto) activeMandatoryList.push('Vehículo sustituto');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold text-[#0A2540] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs group"
            title="Volver a la página principal"
          >
            <ArrowLeft className="w-4 h-4 text-blue-800 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Inicio</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                Informe Técnico Comparativo
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.fechaAnalisis || 'Fecha actual'}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Resultados de la Comparación de Seguros
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            <span>Volver al Inicio</span>
          </button>

          <button
            type="button"
            onClick={onNewComparison}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Nueva comparación</span>
          </button>
        </div>
      </div>

      {/* Summary Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-[#0A2540] to-blue-900 rounded-xl p-5 text-white shadow-sm border border-blue-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
              Cliente Evaluado
            </span>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">{profile.clientName}</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-200">
              <Car className="w-4 h-4 text-blue-300" />
              <span>{profile.vehicleAndUsage || 'Vehículo particular'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-blue-800/80 pt-3 lg:pt-0 lg:pl-6">
            <div className="bg-blue-900/40 border border-blue-800/50 rounded-lg p-2.5">
              <span className="text-[10px] text-blue-300 uppercase font-semibold block">
                Presupuesto Anual
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-300">
                ₡{Number(profile.maxBudgetColones || 0).toLocaleString('es-CR')}
              </span>
            </div>

            <div className="bg-blue-900/40 border border-blue-800/50 rounded-lg p-2.5">
              <span className="text-[10px] text-blue-300 uppercase font-semibold block">
                Forma de Pago
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                {profile.paymentMethod || 'Anual'}
              </span>
            </div>

            <div className="bg-blue-900/40 border border-blue-800/50 rounded-lg p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-blue-300 uppercase font-semibold block">
                Propuestas Evaluadas
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white">
                {files.length} documento{files.length > 1 ? 's' : ''} PDF
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Coverages Badges */}
        <div className="mt-4 pt-3.5 border-t border-blue-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-blue-300 text-[11px] font-medium mr-1">
            Coberturas obligatorias exigidas:
          </span>
          {activeMandatoryList.map((cov, i) => (
            <span
              key={i}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{cov}</span>
            </span>
          ))}
          {profile.priorities && (
            <div className="w-full text-[11px] text-blue-200/90 mt-1.5 flex items-start space-x-1.5">
              <span className="text-amber-300 font-semibold shrink-0">Prioridades:</span>
              <span className="italic">{profile.priorities}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Comparative Table */}
      <ComparisonTable
        proposals={result.proposals}
        recommendedInsurer={result.propuestaRecomendada}
      />

      {/* The Two Result Boxes (Recommendation & WhatsApp message) */}
      <ResultCards
        recomendacionPreliminar={result.recomendacionPreliminar}
        propuestaRecomendada={result.propuestaRecomendada}
        mensajeWhatsApp={result.mensajeWhatsApp}
        onReset={onBackToHome}
        clientName={profile.clientName}
      />

      {/* Prominent Bottom Back to Home Button */}
      <div className="flex justify-center pt-2 pb-6 no-print">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-[#0A2540] bg-white hover:bg-blue-50 border-2 border-blue-300 hover:border-blue-500 transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Home className="w-5 h-5 text-blue-800" />
          <span>Volver al Inicio (Modificar datos o realizar nueva consulta)</span>
        </button>
      </div>
    </div>
  );
};
