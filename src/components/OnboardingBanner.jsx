import React, { useState } from "react";
import { Users, Plus, DoorOpen, Copy, Check, Loader2 } from "lucide-react";
import { useFamily } from "../hooks/useFamily";

export function OnboardingBanner({ userId, onRefresh }) {
  const { createFamily, joinFamily } = useFamily();
  const [mode, setMode] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const isInputValid =
    mode === "create"
      ? inputValue.trim().length >= 3
      : inputValue.trim().length > 0;

  const handleAction = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        // Agora usamos a lógica centralizada do hook
        const { inviteCode } = await createFamily(userId, inputValue);
        setGeneratedCode(inviteCode);
      } else {
        // O joinFamily agora já herda o house_id automaticamente
        await joinFamily(userId, inputValue);
        onRefresh();
      }
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tela de Sucesso (Exibe o código gerado)
  if (generatedCode) {
    return (
      <div className="bg-emerald-600 rounded-2xl p-5 md:p-6 text-white shadow-lg mb-8 relative overflow-hidden">
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
                Compartilhe o código abaixo para que outros membros entrem na
                sua casa.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-emerald-200 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">
                Código de Convite Único
              </span>
              <span className="font-mono text-4xl tracking-[0.3em] font-black text-white">
                {generatedCode}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                onRefresh(); // Isso vai disparar o fetch e esconder o banner no Dashboard
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
    <div className="bg-slate-900 rounded-2xl p-5 md:p-8 text-white shadow-xl mb-8 overflow-hidden relative border border-slate-800">
      <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
        <Users size={200} />
      </div>

      {!mode ? (
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-bold mb-1">
              Você está voando solo! 🚀
            </h3>
            <p className="text-slate-400 text-sm">
              Crie uma família para sua casa ou utilize um código de convite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
            <button
              onClick={() => setMode("create")}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} />
              <span>Criar Família</span>
            </button>

            <button
              onClick={() => setMode("join")}
              className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
            >
              <DoorOpen size={18} />
              <span>Tenho um Código</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold mb-4 text-center md:text-left">
            {mode === "create" ? "Nome da Família" : "Código de Convite"}
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div
                className={`flex-1 flex items-center bg-slate-800 border rounded-xl px-4 py-3 transition-all ${
                  inputValue.length > 0 && !isInputValid && mode === "create"
                    ? "border-amber-500/50 ring-2 ring-amber-500/20"
                    : "border-slate-700 focus-within:ring-2 focus-within:ring-green-500"
                }`}
              >
                {mode === "create" ? (
                  <span className="text-slate-400 font-bold mr-2 select-none whitespace-nowrap">
                    Família
                  </span>
                ) : (
                  <DoorOpen size={18} className="text-slate-400 mr-2" />
                )}

                <input
                  autoFocus
                  type="text"
                  placeholder={mode === "create" ? "Ex: Mafra" : "Ex: AB12CD"}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 uppercase font-mono"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  disabled={loading || !isInputValid}
                  onClick={handleAction}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-white"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={18} /> Confirmar
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMode(null);
                    setInputValue("");
                  }}
                  className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
