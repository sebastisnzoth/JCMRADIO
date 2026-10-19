/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import UserApp from './components/UserApp';
import ErrorBoundary from './components/ErrorBoundary';

// El panel se descarga solo al entrar a /admin, así la radio pública carga más rápido.
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
          <Routes>
            <Route path="/" element={<UserApp />} />
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<div className="min-h-screen grid place-items-center text-zinc-500">Cargando panel…</div>}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
