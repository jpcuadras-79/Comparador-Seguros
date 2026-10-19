import React from 'react';
import { SavedComparisonDoc } from '../lib/firebase';
import { X, Clock, Car, Trash2, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comparisons: SavedComparisonDoc[];
  onSelectComparison: (comp: SavedComparisonDoc) => void;
  onDeleteComparison: (id: string) => void;
}

export const HistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  comparisons,
  onSelectComparison,
  onDeleteComparison,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Mis Cotizaciones Guardadas
              </h3>
              <p className="text-xs text-slate-500">
                Historial de comparaciones generadas bajo tu usuario
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Comparisons */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {comparisons.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                No tienes comparaciones guardadas aún
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Al realizar una comparación con Gemini, se guardará automáticamente en tu cuenta.
              </p>
            </div>
          ) : (
            comparisons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {c.clientName}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.2 rounded">
                      ₡{Number(c.maxBudgetColones || 0).toLocaleString('es-CR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.vehicleAndUsage}</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium">
                    Sugerida: <strong>{c.propuestaRecomendada || 'Consultar'}</strong> • {new Date(c.createdAt).toLocaleDateString('es-CR')}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectComparison(c);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <span>Ver informe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteComparison(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar de mi historial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
