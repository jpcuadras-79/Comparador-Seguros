import React, { useRef } from 'react';
import { FileUp, FileText, X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { ProposalFile } from '../types/insurance';
import { generateSampleProposals } from '../utils/samplePdfs';

interface Props {
  files: ProposalFile[];
  onFilesChange: (files: ProposalFile[]) => void;
  isLoading: boolean;
}

export const ProposalUploader: React.FC<Props> = ({ files, onFilesChange, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    const remainingSlots = 3 - files.length;
    if (remainingSlots <= 0) {
      alert('Solo se pueden subir un máximo de 3 propuestas.');
      return;
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    const newFiles: ProposalFile[] = [];

    for (const file of filesToProcess) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`El archivo "${file.name}" no es un PDF válido.`);
        continue;
      }

      const base64 = await readFileAsBase64(file);
      newFiles.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        base64,
        source: 'upload',
      });
    }

    onFilesChange([...files, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Keep pure base64 or with prefix, server strips prefix
        const pureBase64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(pureBase64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleLoadSamples = () => {
    const samples = generateSampleProposals();
    onFilesChange(samples);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A2540] text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-800">Propuestas</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sube de 1 a 3 archivos PDF con las cotizaciones de las aseguradoras (una por aseguradora).
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSamples}
          disabled={isLoading}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          title="Carga 3 PDFs con cotizaciones reales de Costa Rica (INS, Quálitas y ASSA)"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Cargar propuestas de prueba (INS, Quálitas, ASSA)</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileChange}
          disabled={isLoading || files.length >= 3}
          className="hidden"
          id="pdf-upload-input"
        />

        {files.length < 3 ? (
          <label
            htmlFor="pdf-upload-input"
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Haz clic para seleccionar o arrastra archivos PDF
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formatos aceptados: .PDF (Máximo 3 propuestas en total)
            </p>
            <span className="mt-3 inline-flex items-center text-xs font-medium text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
              {files.length === 0 ? 'Sin archivos seleccionados' : `${files.length} de 3 cargados`}
            </span>
          </label>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-2.5 text-xs text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Has alcanzado el límite máximo de 3 propuestas. Puedes remover alguna para cargar otra.
            </span>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Archivos cargados ({files.length} de 3):</span>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              disabled={isLoading}
              className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Limpiar todos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className="p-2 rounded-md bg-rose-100 text-rose-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold text-slate-800 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                      <span>Propuesta #{idx + 1}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      {file.source === 'sample' && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                          Demo CR
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  disabled={isLoading}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title="Eliminar este archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Para iniciar la comparación, sube al menos 1 propuesta en PDF o haz clic en "Cargar propuestas de prueba".
          </span>
        </div>
      )}
    </div>
  );
};
