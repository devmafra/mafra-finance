import { supabase } from "../lib/supabase";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LogOut,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
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
          <div className="flex flex-col items-end">
            {" "}
            {/* Alinhamento total à direita */}
            {/* Nome do Usuário */}
            <span className="text-sm font-black text-slate-800 leading-tight">
              {myProfile?.full_name?.split(" ")[0] || "Usuário"}
            </span>
            {/* Grupo: Família + Código */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">
                {myProfile?.family_name || "Solo"}
              </span>

              {myProfile?.join_code && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(myProfile.join_code);
                    // Aqui você pode disparar um pequeno toast ou apenas o log
                  }}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-md transition-all group border border-slate-200/50"
                  title="Copiar código da família"
                >
                  <span className="text-[9px] font-mono font-bold text-slate-500 group-hover:text-green-600">
                    #{myProfile.join_code}
                  </span>
                  <Copy
                    size={8}
                    className="text-slate-400 group-hover:text-green-500"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-black text-xs uppercase">
            {myProfile?.full_name?.charAt(0) || "U"}
          </div>

          {/* Logout */}
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
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
