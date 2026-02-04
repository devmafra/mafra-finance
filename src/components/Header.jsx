import { supabase } from "../lib/supabase";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LogOut,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Header({
  currentMonth,
  setCurrentMonth,
  onAddBill,
  myProfile,
}) {
  return (
    <div className="max-w-4xl mx-auto mb-8 space-y-4">
      {/* 1. Top Bar: Identidade e Perfil */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <CalendarIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            Mafra<span className="text-green-600">Finance</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-700">
              {myProfile?.full_name}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-medium">
              {myProfile?.family_name || "Membro Solo"}
            </span>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 2. Control Bar: Navegação de Data e Ações */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Seletor de Mês */}
        <div className="flex items-center bg-slate-50 rounded-xl p-1 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-sm font-bold px-4 text-slate-700 min-w-[140px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Ação Principal */}
        <button
          onClick={onAddBill}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} />
          <span>Nova Despesa</span>
        </button>
      </div>
    </div>
  );
}
