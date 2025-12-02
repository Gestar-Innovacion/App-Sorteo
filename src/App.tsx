import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import MinimalistLoader from './components/MinimalistLoader';
import './index.css';

// Lazy loading de páginas para mejor rendimiento inicial
const HomePage = lazy(() => import('./pages/HomePage'));
const ParticipantPage = lazy(() => import('./pages/ParticipantPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Componente de loading mientras cargan las páginas
const PageLoader = () => (
  <MinimalistLoader
    text="Cargando"
    color="#3b82f6"
    blur={10}
  />
);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/participant" element={<ParticipantPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
