import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { ProposalUploader } from './components/ProposalUploader';
import { ClientProfileForm } from './components/ClientProfileForm';
import { ResultsPage } from './components/ResultsPage';
import { AdminPanel } from './components/AdminPanel';
import { HistoryModal } from './components/HistoryModal';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Footer } from './components/Footer';
import { ClientProfile, ProposalFile, ComparisonResponse } from './types/insurance';
import { generateSampleProposals } from './utils/samplePdfs';
import {
  saveComparisonToFirestore,
  fetchUserComparisons,
  deleteComparisonDoc,
  SavedComparisonDoc,
} from './lib/firebase';
import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  LogIn,
  CheckCircle,
} from 'lucide-react';

function ComparatorApp() {
  const { user, isAdmin, login, isLoading: authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState<'home' | 'results' | 'admin'>('home');
  const [files, setFiles] = useState<ProposalFile[]>([]);
  const [profile, setProfile] = useState<ClientProfile>({
    clientName: 'Carlos Alvarado Mora',
    vehicleAndUsage: 'Toyota RAV4 2023 - Uso Particular y viajes de trabajo',
    maxBudgetColones: 650000,
    mandatoryCoverages: {
      colision: true,
      robo: true,
      asistenciaVial: true,
      fenomenosNaturales: true,
      vehiculoSustituto: true,
    },
    priorities:
      'Menor deducible en colisión y asistencia de grúa sin límite en GAM y vehículo sustituto incluido.',
    paymentMethod: 'Anual de contado',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Saved comparisons for the authenticated advisor
  const [savedComparisons, setSavedComparisons] = useState<SavedComparisonDoc[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Initialize with sample proposals for immediate testing convenience
  useEffect(() => {
    try {
      const initialSamples = generateSampleProposals();
      setFiles(initialSamples);
    } catch (e) {
      console.warn('Could not load initial sample PDFs:', e);
    }
  }, []);

  // Fetch saved comparisons when user is logged in
  useEffect(() => {
    if (user?.uid) {
      fetchUserComparisons(user.uid)
        .then((list) => setSavedComparisons(list))
        .catch((err) => console.warn('Could not load saved comparisons:', err));
    } else {
      setSavedComparisons([]);
    }
  }, [user?.uid]);

  // Handle browser popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else if (window.location.hash === '#resultado' && result) {
        setCurrentPage('results');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [result]);

  const handleCompare = async () => {
    if (files.length === 0) {
      setError('Debes subir al menos 1 archivo PDF de propuesta para comparar.');
      return;
    }
    if (!profile.clientName.trim()) {
      setError('Por favor indica el nombre del cliente.');
      return;
    }

    if (user && user.status === 'suspended') {
      setError('Tu cuenta de asesor se encuentra suspendida. Contacta al administrador.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files,
          profile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar las propuestas.');
      }

      setResult(data);

      // Auto-save comparison to Firestore if user is logged in
      if (user) {
        try {
          const compId = await saveComparisonToFirestore(profile, data, user);
          const newDoc: SavedComparisonDoc = {
            id: compId,
            userId: user.uid,
            clientName: profile.clientName,
            vehicleAndUsage: profile.vehicleAndUsage,
            maxBudgetColones: profile.maxBudgetColones,
            mandatoryCoverages: profile.mandatoryCoverages,
            priorities: profile.priorities,
            paymentMethod: profile.paymentMethod,
            proposals: data.proposals,
            propuestaRecomendada: data.propuestaRecomendada,
            recomendacionPreliminar: data.recomendacionPreliminar,
            mensajeWhatsApp: data.mensajeWhatsApp,
            createdAt: new Date().toISOString(),
          };
          setSavedComparisons([newDoc, ...savedComparisons]);
        } catch (saveErr) {
          console.warn('Auto-save comparison error:', saveErr);
        }
      }

      setCurrentPage('results');
      window.history.pushState({ page: 'results' }, '', '#resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error during comparison:', err);
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    if (window.location.hash) {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setCurrentPage('admin');
    window.history.pushState({ page: 'admin' }, '', '#admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewComparison = () => {
    setResult(null);
    setError(null);
    setCurrentPage('home');
    const samples = generateSampleProposals();
    setFiles(samples);
    setProfile({
      clientName: '',
      vehicleAndUsage: '',
      maxBudgetColones: 600000,
      mandatoryCoverages: {
        colision: true,
        robo: true,
        asistenciaVial: true,
        fenomenosNaturales: true,
        vehiculoSustituto: false,
      },
      priorities: '',
      paymentMethod: 'Anual de contado',
    });
    if (window.location.hash) {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSavedComparison = (saved: SavedComparisonDoc) => {
    setProfile({
      clientName: saved.clientName,
      vehicleAndUsage: saved.vehicleAndUsage,
      maxBudgetColones: saved.maxBudgetColones,
      mandatoryCoverages: (saved.mandatoryCoverages as any) || {
        colision: true,
        robo: true,
        asistenciaVial: true,
        fenomenosNaturales: true,
        vehiculoSustituto: true,
      },
      priorities: saved.priorities,
      paymentMethod: saved.paymentMethod || 'Anual de contado',
    });

    setResult({
      proposals: saved.proposals,
      recomendacionPreliminar: saved.recomendacionPreliminar,
      propuestaRecomendada: saved.propuestaRecomendada,
      mensajeWhatsApp: saved.mensajeWhatsApp,
      fechaAnalisis: new Date(saved.createdAt).toLocaleString('es-CR'),
    });

    setCurrentPage('results');
    window.history.pushState({ page: 'results' }, '', '#resultado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSavedComparison = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta cotización guardada?')) return;
    try {
      await deleteComparisonDoc(id);
      setSavedComparisons(savedComparisons.filter((c) => c.id !== id));
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const isFormValid = files.length > 0 && profile.clientName.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header
        onOpenAdmin={handleOpenAdmin}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedComparisons.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Suspended User Warning */}
        {user && user.status === 'suspended' && (
          <div className="bg-rose-100 border border-rose-300 text-rose-900 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>Cuenta de asesor suspendida:</strong> Tu cuenta no tiene permisos para realizar nuevas comparaciones. Contacta al administrador del sistema.
            </div>
          </div>
        )}

        {/* Unauthenticated Security Banner */}
        {!user && !authLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Modo asesor verificado:</strong> Inicia sesión con tu cuenta de Google institucional para guardar tus comparaciones en la nube y acceder a tus reportes guardados.
              </span>
            </div>
            <button
              type="button"
              onClick={login}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión</span>
            </button>
          </div>
        )}

        {/* Error notification banner if any */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <strong className="font-bold">Error en la comparación: </strong>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* VIEW 1: ADMIN PANEL */}
        {currentPage === 'admin' && isAdmin && (
          <AdminPanel onBackToApp={handleBackToHome} />
        )}

        {/* VIEW 2: HOME (Formulario de Propuestas y Perfil del Cliente) */}
        {currentPage === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Input Configuration Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Section 1: Propuestas */}
              <div className="lg:col-span-5">
                <ProposalUploader
                  files={files}
                  onFilesChange={(newFiles) => {
                    setFiles(newFiles);
                    if (result) setResult(null);
                  }}
                  isLoading={isLoading}
                />
              </div>

              {/* Section 2: Perfil del cliente */}
              <div className="lg:col-span-7">
                <ClientProfileForm
                  profile={profile}
                  onChange={(newProfile) => {
                    setProfile(newProfile);
                    if (result) setResult(null);
                  }}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Big Action Button "Comparar propuestas" */}
            <div className="flex flex-col items-center justify-center pt-2 pb-4 no-print">
              <button
                type="button"
                onClick={handleCompare}
                disabled={!isFormValid || isLoading || user?.status === 'suspended'}
                className={`w-full max-w-md py-4 px-8 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-md ${
                  !isFormValid || isLoading || user?.status === 'suspended'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#0A2540] hover:bg-[#0F3A66] active:bg-[#081d33] text-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analizando propuestas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Comparar propuestas</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              {!isFormValid && (
                <p className="text-xs text-slate-400 mt-2">
                  Sube al menos un PDF y escribe el nombre del cliente para comparar.
                </p>
              )}
            </div>

            {/* Loading Indicator while Gemini analyzes */}
            {isLoading && <LoadingIndicator fileCount={files.length} />}
          </div>
        )}

        {/* VIEW 3: RESULTADOS (Visualización en otra página con opción "Volver al Inicio") */}
        {currentPage === 'results' && result && (
          <ResultsPage
            result={result}
            profile={profile}
            files={files}
            onBackToHome={handleBackToHome}
            onNewComparison={handleNewComparison}
          />
        )}
      </main>

      {/* History Modal for Advisor */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        comparisons={savedComparisons}
        onSelectComparison={handleSelectSavedComparison}
        onDeleteComparison={handleDeleteSavedComparison}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ComparatorApp />
    </AuthProvider>
  );
}
