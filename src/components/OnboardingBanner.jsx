import React, { useState } from "react";
import { Users, Plus, DoorOpen, Copy, Check, ArrowLeft } from "lucide-react";
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
        const { joinCode } = await createFamily(userId, inputValue);
        setGeneratedCode(joinCode);
      } else {
        await joinFamily(userId, inputValue);
        onRefresh();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedCode) {
    return (
      <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Check size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Família Criada com Sucesso!</h3>
            <p className="text-emerald-100 text-sm">
              Compartilhe o código abaixo com os outros membros.
            </p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/20">
          <span className="font-mono text-2xl tracking-widest font-black">
            {generatedCode}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
              onRefresh();
            }}
            className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
          >
            <Copy size={18} /> Copiar e Começar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 overflow-hidden relative border border-slate-800">
      <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
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
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setMode("create")}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Criar Família
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <DoorOpen size={18} /> Tenho um Código
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 animate-in slide-in-from-right-4 duration-300">
          <h3 className="text-lg font-bold mb-4">
            {mode === "create"
              ? "Como se chama sua família?"
              : "Digite o código de convite"}
          </h3>

          {/* 2. VALIDAÇÃO: Container pai para alinhar input + mensagem de erro */}
          <div className="space-y-2">
            <div className="flex gap-3">
              {/* 3. VALIDAÇÃO: Estilo condicional no input (fica âmbar se estiver inválido e o usuário começou a digitar) */}
              <div
                className={`flex-1 flex items-center bg-slate-800 border rounded-xl px-4 py-2 transition-all ${
                  inputValue.length > 0 && !isInputValid && mode === "create"
                    ? "border-amber-500/50 ring-2 ring-amber-500/20" // Sinal de erro sutil
                    : "border-slate-700 focus-within:ring-2 focus-within:ring-green-500"
                }`}
              >
                {mode === "create" && (
                  <span className="text-slate-400 font-bold mr-1.5 select-none">
                    Família
                  </span>
                )}

                <input
                  autoFocus
                  type="text"
                  placeholder={mode === "create" ? "Mafra" : "Ex: AB12CD"}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-600 uppercase"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              {/* 4. VALIDAÇÃO: Botão desabilitado se não passar na regra */}
              <button
                disabled={loading || !isInputValid}
                onClick={handleAction}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-2 rounded-xl font-bold transition-all text-white"
              >
                {loading ? (
                  "Processando..."
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
                className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Cancelar
              </button>
            </div>

            {/* 5. VALIDAÇÃO: Texto de ajuda que aparece apenas no erro do nome curto */}
            {inputValue.length > 0 && !isInputValid && mode === "create" && (
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1">
                O nome precisa de pelo menos 3 letras
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
