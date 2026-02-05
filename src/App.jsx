import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importações do Router
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx"; // Importe a nova página
import { useAuth } from "./hooks/useAuth";
import "./global.css";

export default function App() {
  const { session, loading, user } = useAuth(); // Certifique-se que useAuth retorna 'user' ou pegue do session

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

  // Componente Auxiliar: Protege rotas de Admin
  // (Opcional: se quiser ser rigoroso no front-end também)
  const AdminRoute = ({ children }) => {
    // Verifica se existe sessão E se o email/id é o do admin (ou use a role se tiver carregado)
    if (!session) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login: Se já estiver logado, joga pro Dashboard */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" />}
        />

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

        {/* Qualquer url desconhecida volta pro inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
