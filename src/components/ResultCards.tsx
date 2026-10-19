import React, { useState } from 'react';
import {
  FileText,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Printer,
} from 'lucide-react';

interface Props {
  recomendacionPreliminar: string;
  propuestaRecomendada: string;
  mensajeWhatsApp: string;
  onReset: () => void;
  onBackToHome?: () => void;
  clientName?: string;
}

export const ResultCards: React.FC<Props> = ({
  recomendacionPreliminar,
  propuestaRecomendada,
  mensajeWhatsApp,
  onReset,
  onBackToHome,
  clientName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensajeWhatsApp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar texto:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(mensajeWhatsApp);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Grid of the 2 mandatory boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuadro 1: Recomendación preliminar (borrador) */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-900 to-indigo-800" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Recomendación preliminar (borrador)
                </h3>
              </div>
              <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Uso interno asesor
              </span>
            </div>

            {propuestaRecomendada && (
              <div className="mt-3.5 inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-lg text-xs font-semibold">
                <span>Aseguradora sugerida:</span>
                <span className="underline decoration-amber-500 font-bold">
                  {propuestaRecomendada}
                </span>
              </div>
            )}

            <div className="mt-3.5 bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
              {recomendacionPreliminar ||
                'No se pudo generar la recomendación preliminar.'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Máximo 5 líneas con justificación de montos según prioridades.</span>
            </span>
          </div>
        </div>

        {/* Cuadro 2: Mensaje sugerido para el cliente (WhatsApp) */}
        <div className="bg-[#f0f2f5] rounded-xl border border-emerald-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#25D366]" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Mensaje sugerido para el cliente (WhatsApp)
                </h3>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Listo para enviar
              </span>
            </div>

            {/* WhatsApp Chat Bubble style */}
            <div className="mt-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs text-slate-800 text-sm leading-relaxed whitespace-pre-line relative font-normal">
              <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">
                WhatsApp
              </div>
              {mensajeWhatsApp || 'No se generó el mensaje de WhatsApp.'}
            </div>
          </div>

          {/* Action buttons inside WhatsApp card */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar mensaje</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors cursor-pointer"
                title="Abrir WhatsApp con este texto pre-cargado"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              Máx 8 líneas • Sin tecnicismos • Sin plazos
            </span>
          </div>
        </div>
      </div>

      {/* Primary bottom action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 no-print">
        <div className="text-xs text-slate-500">
          ¿Deseas modificar las coberturas o realizar otra comparación?
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir informe</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome || onReset}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-blue-800" />
            <span>Volver al Inicio</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
          >
            <span>Nueva comparación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
