import React, { useState } from "react";
import { Users, Plus, DoorOpen, Copy, Check } from "lucide-react";
import { useFamily } from "../hooks/useFamily";

export function OnboardingBanner({ userId, onRefresh }) {
  const { createFamily, joinFamily } = useFamily();
  const [mode, setMode] = useState(null); // 'create' | 'join' | null
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

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

  // Se ele acabou de criar, mostramos o código para ele copiar
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
              onRefresh(); // Fecha o banner ao atualizar o perfil
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
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl mb-8 overflow-hidden relative">
      {/* Background Decorativo */}
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
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder={
                mode === "create" ? "Ex: Família Mafra" : "Ex: AB12CD"
              }
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              disabled={loading || !inputValue}
              onClick={handleAction}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 px-6 py-2 rounded-xl font-bold transition-all"
            >
              {loading ? "Processando..." : "Confirmar"}
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-slate-400 hover:text-white px-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
