import React, { useState } from "react"; // Adicionado useState
import { supabase } from "../lib/supabase";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFamily } from "../hooks/useFamily";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  UserMinus,
  ShieldAlert,
} from "lucide-react";

export function Header({
  currentMonth,
  setCurrentMonth,
  onAddBill,
  myProfile,
  onRefresh,
}) {
  const isToday = isSameMonth(currentMonth, new Date());
  const { leaveFamily } = useFamily();
  const navigate = useNavigate();

  // Estado para feedback do botão de copiar
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!myProfile?.join_code) return;
    navigator.clipboard.writeText(myProfile.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reseta o ícone após 2s
  };

  const handleLeave = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja sair da família? Suas contas individuais continuam salvas, mas você não verá mais o rateio do grupo.",
    );

    if (confirmed) {
      try {
        await leaveFamily(myProfile.user_id);
        onRefresh();
      } catch (err) {
        alert("Erro ao sair da família: " + err.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 space-y-4">
      {/* 1. Top Bar: Identidade e Perfil */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg shadow-inner">
            <CalendarIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
            Mafra<span className="text-green-600">Finance</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 ">
          {/* Info do Usuário Alinhada à Direita */}
          <div className="flex flex-col items-end justify-center">
            <span className="text-sm font-black text-slate-800 leading-tight">
              {myProfile?.full_name?.split(" ")[0] || "Usuário"}
            </span>

            <div className="flex items-center gap-2 mt-0.5">
              {/* Prefixo Fixo "Família" */}
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em] text-right">
                {myProfile?.family_name
                  ? `Família ${myProfile.family_name}`
                  : "Voo Solo"}
              </span>

              {myProfile?.join_code && (
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all border ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-slate-100 border-slate-200/50 text-slate-500 hover:bg-slate-200"
                  }`}
                  title="Copiar código da família"
                >
                  <span className="text-[9px] font-mono font-bold">
                    #{myProfile.join_code}
                  </span>
                  {copied ? <Check size={8} /> : <Copy size={8} />}
                </button>
              )}
            </div>
          </div>

          {/* Avatar com Letra Inicial */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-black text-xs uppercase select-none">
            {myProfile?.full_name?.charAt(0) || "U"}
          </div>

          {/* Ações de Conta */}
          <div className="flex items-center border-l border-slate-200 ml-1 pl-3 gap-1">
            {myProfile?.family_id && (
              <button
                onClick={handleLeave}
                className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                title="Sair da Família"
              >
                <UserMinus size={18} />
              </button>
            )}

            {myProfile?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="p-2 bg-slate-800 text-yellow-400 rounded-full hover:bg-slate-700 hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
                title="Painel Admin"
              >
                <ShieldAlert size={18} />
              </button>
            )}

            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Sair do App"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Control Bar (Seletor de Mês e Botão Novo) */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 flex-1 sm:flex-none">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronLeft size={18} />
            </button>

            <h2 className="text-sm font-bold px-2 sm:px-4 text-slate-700 min-w-[120px] sm:min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
              title="Voltar para este mês"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        <button
          onClick={onAddBill}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2 active:scale-95 group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          <span>Nova Despesa</span>
        </button>
      </div>
    </div>
  );
}
