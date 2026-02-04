import { supabase } from "../lib/supabase";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LogOut,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw, // Ícone para o botão "Hoje"
} from "lucide-react";

export function Header({
  currentMonth,
  setCurrentMonth,
  onAddBill,
  myProfile,
}) {
  const isToday = isSameMonth(currentMonth, new Date());

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

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col text-right">
            {myProfile ? (
              <>
                <span className="text-sm font-bold text-slate-700 leading-tight animate-in fade-in duration-500">
                  {myProfile.full_name?.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  {myProfile.family_name || "Solo"}
                </span>
              </>
            ) : (
              /* Skeleton Loading: Uma barrinha cinza que pisca */
              <div className="space-y-1 animate-pulse">
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-2 w-10 bg-slate-100 rounded ml-auto"></div>
              </div>
            )}
          </div>

          {/* Avatar Simples */}
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
            {myProfile?.full_name?.charAt(0) || "U"}
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Seletor de Mês */}
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

          {/* Botão Voltar para Hoje */}
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

        {/* Botão de Ação Principal */}
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
