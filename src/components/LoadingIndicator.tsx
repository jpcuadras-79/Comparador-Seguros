import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, FileSearch, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  fileCount: number;
}

export const LoadingIndicator: React.FC<Props> = ({ fileCount }) => {
  const [step, setStep] = useState(0);

  const steps = [
    'Leyendo documentos PDF con Gemini 3.8 Flash...',
    'Extrayendo primas en colones, deducibles y exclusiones...',
    'Verificando coberturas obligatorias y presupuesto...',
    'Aplicando reglas de semáforo técnico (Verde, Amarillo, Rojo)...',
    'Generando recomendación preliminar y mensaje para WhatsApp...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-md p-8 sm:p-12 text-center max-w-xl mx-auto my-8 transition-all animate-in fade-in zoom-in-95 duration-200">
      <div className="relative inline-flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800">Analizando propuestas...</h3>
      <p className="text-sm text-slate-500 mt-1.5">
        Gemini está examinando {fileCount} documento{fileCount > 1 ? 's' : ''} PDF sin inventar datos.
      </p>

      {/* Progress steps */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-2.5 max-w-md mx-auto">
        {steps.map((text, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-2.5 text-xs transition-opacity duration-300 ${
                isCurrent
                  ? 'text-blue-900 font-bold'
                  : isDone
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-blue-700 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>{text}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 text-[11px] text-slate-400">
        Este proceso suele tomar entre 4 y 10 segundos según el número de páginas.
      </div>
    </div>
  );
};
