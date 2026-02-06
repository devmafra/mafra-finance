import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Users,
  Plus,
  DoorOpen,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useFamily } from "../hooks/useFamily";

export function OnboardingBanner({ userId, onRefresh }) {
  const { createFamily, joinFamily } = useFamily();
  const [mode, setMode] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  // 1. VALIDAÇÃO: Lógica para habilitar/desabilitar o botão
  const isInputValid =
    mode === "create"
      ? inputValue.trim().length >= 3 // Nome da família: min 3 letras
      : inputValue.trim().length > 0; // Código: pelo menos 1 caractere

  const handleAction = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        const joinCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        // 2. CRIA A FAMÍLIA
        const { data: newFamily, error: createError } = await supabase
          .from("families")
          .insert({
            name: inputValue,
            join_code: joinCode,
          })
          .select()
          .single();

        if (createError) throw createError;

        // 3. ATUALIZA O PERFIL
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            family_id: newFamily.id,
            role: "admin",
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;

        // 4. DEFINE O CÓDIGO PARA MOSTRAR NA TELA DE SUCESSO
        setGeneratedCode(joinCode);
      } else {
        await joinFamily(userId, inputValue);
        onRefresh();
      }
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedCode) {
    return (
      <div className="bg-emerald-600 rounded-2xl p-5 md:p-6 text-white shadow-lg mb-8 relative overflow-hidden">
        {/* Detalhe visual de fundo para parecer mais "Premium" */}
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Check size={160} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
            <div className="bg-white/20 p-3 rounded-full shrink-0">
              <Check size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Família Criada! 🏠</h3>
              <p className="text-emerald-100 text-sm">
                Compartilhe o código abaixo para que outros membros possam
                entrar.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-emerald-200 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">
                Código de Convite
              </span>
              <span className="font-mono text-4xl tracking-[0.3em] font-black text-white">
                {generatedCode}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                onRefresh();
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-4 rounded-xl font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-md"
            >
              <Copy size={20} />
              <span>Copiar e Começar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl mb-8 overflow-hidden relative border border-slate-800">
      <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
        <Users size={200} />
      </div>

      {!mode ? (
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-1">
              Você está voando solo! 🚀
            </h3>
            <p className="text-slate-400 text-sm">
              Crie uma família para dividir contas ou entre em uma existente.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setMode("create")}
              className="w-full sm:flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Criar Família
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full sm:flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <DoorOpen size={18} /> Tenho um Código
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4 text-center md:text-left">
            {mode === "create"
              ? "Como se chama sua família?"
              : "Digite o código de convite"}
          </h3>

          <div className="space-y-4">
            {/* Container do Input e Botões adaptável */}
            <div className="flex flex-col md:flex-row gap-3">
              <div
                className={`flex-1 flex items-center bg-slate-800 border rounded-xl px-4 py-3 transition-all ${
                  inputValue.length > 0 && !isInputValid && mode === "create"
                    ? "border-amber-500/50 ring-2 ring-amber-500/20"
                    : "border-slate-700 focus-within:ring-2 focus-within:ring-green-500"
                }`}
              >
                {mode === "create" && (
                  <span className="text-slate-400 font-bold mr-2 select-none whitespace-nowrap">
                    Família
                  </span>
                )}

                <input
                  autoFocus
                  type="text"
                  placeholder={mode === "create" ? "Ex: Mafra" : "Ex: AB12CD"}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 uppercase"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              {/* Ações: Confirmar e Cancelar */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  disabled={loading || !isInputValid}
                  onClick={handleAction}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold transition-all text-white"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={18} />
                      Confirmar
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMode(null);
                    setInputValue("");
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 text-slate-400 hover:text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  <ArrowLeft size={16} />
                  <span className="md:hidden">Sair</span>
                  <span className="hidden md:inline">Cancelar</span>
                </button>
              </div>
            </div>

            {inputValue.length > 0 && !isInputValid && mode === "create" && (
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider ml-1 text-center md:text-left">
                O nome precisa de pelo menos 3 letras
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
