import React, { useState } from "react";
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

  const [copied, setCopied] = useState(false);

  // Alterado para invite_code
  const handleCopyCode = () => {
    if (!myProfile?.invite_code) return;
    navigator.clipboard.writeText(myProfile.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-2 sm:px-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-green-600 p-2 rounded-lg shadow-inner">
            <CalendarIcon className="text-white w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-800 tracking-tighter uppercase">
            Mafra<span className="text-green-600">Finance</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 ml-auto">
          <div className="flex flex-col items-end justify-center min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-800 leading-tight truncate">
              {myProfile?.full_name?.split(" ")[0] || "Usuário"}
            </span>

            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap justify-end">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-[0.05em] sm:tracking-[0.1em] text-right">
                {myProfile?.family_id
                  ? `${myProfile?.family_name || "Carregando..."}`
                  : "Voo Solo"}
              </span>

              {/* Alterado para invite_code */}
              {myProfile?.invite_code && (
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded-md transition-all border text-nowrap ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-slate-100 border-slate-200/50 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase">
                    #{myProfile.invite_code}
                  </span>
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                </button>
              )}
            </div>
          </div>

          <div className="w-8 sm:w-10 h-8 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-black text-[10px] sm:text-xs uppercase select-none">
            {myProfile?.full_name?.charAt(0) || "U"}
          </div>

          <div className="flex items-center border-l border-slate-200 ml-0.5 sm:ml-1 pl-1 sm:pl-3 gap-0 sm:gap-1">
            {myProfile?.family_id && (
              <button
                onClick={handleLeave}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all active:scale-95"
                title="Sair da Família"
              >
                <UserMinus size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}

            {myProfile?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="p-1.5 sm:p-2 bg-slate-800 text-yellow-400 rounded-full hover:bg-slate-700 transition-all shadow-lg active:scale-95"
                title="Painel Admin"
              >
                <ShieldAlert size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}

            <button
              onClick={() => supabase.auth.signOut()}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
              title="Sair do App"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 flex-1 sm:flex-none justify-between sm:justify-start">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 active:scale-95"
            >
              <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <h2 className="text-xs sm:text-sm font-bold px-1.5 sm:px-2 text-slate-700 min-w-[100px] sm:min-w-[120px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 sm:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 active:scale-95"
            >
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="p-1.5 sm:p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all active:scale-95 shrink-0"
            >
              <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          )}
        </div>

        <button
          onClick={onAddBill}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>Nova Despesa</span>
        </button>
      </div>
    </div>
  );
}
