import React, { useState } from "react";
import {
  Users,
  Plus,
  DoorOpen,
  Copy,
  Check,
  Loader2,
  Home,
  Users2,
} from "lucide-react";
import { useFamily } from "../hooks/useFamily";

export function OnboardingBanner({ userId, onRefresh }) {
  const { createHouseAndFamily, joinFamily } = useFamily(); // Usando a nova função do hook
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  // Estados para os inputs
  const [houseName, setHouseName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  // Validação: No 'create' precisa dos dois nomes. No 'join' precisa do código.
  const isInputValid =
    mode === "create"
      ? houseName.trim().length >= 3 && familyName.trim().length >= 3
      : inviteCodeInput.trim().length > 0;

  const handleAction = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        // 1. Cria a Casa e a Família Inicial
        const { inviteCode } = await createHouseAndFamily(
          userId,
          houseName,
          familyName,
        );
        setGeneratedCode(inviteCode);
      } else {
        // 2. Apenas entra em uma existente
        await joinFamily(userId, inviteCodeInput);
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
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Check size={160} />
        </div>

        <div className="relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <Check size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Tudo pronto na {houseName}! 🏠
              </h3>
              <p className="text-emerald-100 text-sm">
                Sua casa foi criada com a <b>{familyName}</b>. Use o código
                abaixo para convidar membros.
              </p>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col items-center py-2 mb-4">
              <span className="text-emerald-200 text-[10px] uppercase font-black tracking-widest mb-1">
                Código de Convite
              </span>
              <span className="font-mono text-4xl font-black">
                {generatedCode}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                onRefresh();
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-4 rounded-xl font-bold hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Copy size={20} />
              <span>Copiar e Entrar no Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-5 md:p-8 text-white shadow-xl mb-8 overflow-hidden relative border border-slate-800">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <Users size={200} />
      </div>

      {!mode ? (
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-bold mb-1">
              Você está voando solo! 🚀
            </h3>
            <p className="text-slate-400 text-sm">
              Crie uma casa para gerenciar famílias ou entre em uma existente.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setMode("create")}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} /> Criar Casa e Família
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
            >
              <DoorOpen size={18} /> Tenho um Código
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold mb-6 text-center md:text-left">
            {mode === "create"
              ? "Configurando sua nova Casa"
              : "Entrar em uma Casa"}
          </h3>

          <div className="space-y-4">
            {mode === "create" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Nome da Casa */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    Nome do Condomínio / Casa
                  </label>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                    <Home size={18} className="text-slate-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Ex: Residencial Mafra"
                      className="bg-transparent border-none outline-none text-white w-full"
                      value={houseName}
                      onChange={(e) => setHouseName(e.target.value)}
                    />
                  </div>
                </div>
                {/* Input Nome da Família */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    Sua Família Inicial
                  </label>
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                    <Users2 size={18} className="text-slate-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Ex: Família Davi"
                      className="bg-transparent border-none outline-none text-white w-full"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Input Único para o Código */
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                <DoorOpen size={18} className="text-slate-400 mr-2" />
                <input
                  autoFocus
                  type="text"
                  placeholder="DIGITE O CÓDIGO (EX: AB12CD)"
                  className="bg-transparent border-none outline-none text-white w-full font-mono uppercase"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setMode(null)}
                className="px-6 py-3 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                disabled={loading || !isInputValid}
                onClick={handleAction}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Check size={18} /> Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
