import React from "react";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Login } from "./pages/Login.jsx";
import { useAuth } from "./hooks/useAuth";
import "./global.css";

export default function App() {
  const { session, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );

  return session ? <Dashboard /> : <Login />;
}
