import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Lock,
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  LogIn,
  User,
} from "lucide-react";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Estados de Controle da Tela
  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Criar Conta
  const [isRecoveryMode, setIsRecoveryMode] = useState(false); // Alterna para Recuperação
  const [recoverySent, setRecoverySent] = useState(false);

  // Função Unificada: Login ou Cadastro
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // --- MODO CADASTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        alert(
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
        );
        setIsSignUp(false);
      } else {
        // --- MODO LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função de Esqueci minha Senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/update-password",
      });

      if (error) throw error;
      setRecoverySent(true);
    } catch (error) {
      alert("Erro ao enviar e-mail: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">MafraFinance</h1>
          <p className="text-slate-400 text-sm">
            Controle familiar inteligente
          </p>
        </div>

        <div className="p-8">
          {/* --- TELA 1: RECUPERAÇÃO DE SENHA --- */}
          {isRecoveryMode ? (
            <div>
              <button
                onClick={() => {
                  setIsRecoveryMode(false);
                  setRecoverySent(false);
                }}
                className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para Login
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Recuperar Acesso
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Digite seu e-mail para receber o link.
                </p>
              </div>

              {recoverySent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="font-bold text-green-800">E-mail Enviado!</h3>
                  <p className="text-sm text-green-700 mt-2">
                    Verifique sua caixa de entrada (e spam).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Seu E-mail
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3 text-slate-400"
                        size={18}
                      />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Enviar Link"
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* --- TELA 2: LOGIN OU CADASTRO --- */
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {isSignUp ? "Crie sua Conta" : "Bem-vindo de volta"}
                </h2>
              </div>
              {isSignUp && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Como quer ser chamado?"
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />

                  <input
                    type="email"
                    required
                    placeholder="digite seu email"
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    placeholder="digite sua senha"
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Link "Esqueci a Senha" (Só aparece no Login) */}
                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setIsRecoveryMode(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>

              {/* Botão Principal */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isSignUp
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : isSignUp ? (
                  <>
                    {" "}
                    <UserPlus size={18} /> Criar Conta{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <LogIn size={18} /> Entrar{" "}
                  </>
                )}
              </button>

              {/* Toggle: Login <-> Cadastro */}
              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {isSignUp ? "Já tem uma conta?" : "Ainda não tem conta?"}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 font-bold text-blue-600 hover:underline"
                  >
                    {isSignUp ? "Fazer Login" : "Cadastre-se"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">© 2026 MafraFinance Security</p>
        </div>
      </div>
    </div>
  );
}
