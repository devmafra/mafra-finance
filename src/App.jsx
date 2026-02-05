import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase"; // Importe o client para ouvir o evento

// Páginas
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { UpdatePassword } from "./pages/UpdatePassword.jsx"; //

import { useAuth } from "./hooks/useAuth";
import "./global.css";

export default function App() {
  const { session, loading } = useAuth();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        window.location.hash = "/update-password";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 font-bold animate-pulse">
        Carregando MafraFinance...
      </div>
    );

  // Componente Auxiliar: Protege rotas que exigem login
  const PrivateRoute = ({ children }) => {
    return session ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" />}
        />

        {/* --- NOVA ROTA: Atualizar Senha --- */}
        {/* Não precisa de proteção rígida, pois o link do e-mail já cria uma sessão temporária */}
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Rota Principal (Dashboard) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Rota de Admin (God Mode) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
