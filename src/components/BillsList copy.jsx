import React from "react";
import { Trash2, CheckCircle, Circle, Info } from "lucide-react";
import { supabase } from "../lib/supabase";

export function BillsList({ loading, data, onRefresh, myUserId }) {
  // FILTRO: Só mostra o que pertence ao usuário logado
  const myShares = data.filter((item) => item.user_id === myUserId);

  async function handleDelete(expenseId, description) {
    if (!window.confirm(`Excluir "${description}" para TODOS?`)) return;
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);
    if (!error) onRefresh();
  }

  async function togglePayment(expenseId, profileId, currentStatus) {
    const { error } = await supabase
      .from("expense_splits")
      .update({ is_paid: !currentStatus })
      .eq("expense_id", expenseId)
      .eq("profile_id", profileId);
    if (!error) onRefresh();
  }

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <span className="font-semibold text-slate-700">
          Minhas Despesas do Mês
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {myShares.length} contas
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center animate-pulse text-slate-400">
            Carregando...
          </div>
        ) : myShares.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            Você não tem cotas registradas este mês.
          </div>
        ) : (
          myShares.map((item) => (
            <div
              key={item.expense_id}
              className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group"
            >
              <div className="flex gap-4 items-center">
                <button
                  onClick={() =>
                    togglePayment(
                      item.expense_id,
                      item.profile_id,
                      item.is_paid,
                    )
                  }
                  className={`transition-colors ${item.is_paid ? "text-green-500" : "text-slate-300 hover:text-amber-500"}`}
                >
                  {item.is_paid ? (
                    <CheckCircle size={22} />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <div>
                  <p
                    className={`font-bold text-sm ${item.is_paid ? "text-slate-400 line-through" : "text-slate-800"}`}
                  >
                    {item.description}
                  </p>
                  {/* Badge do Valor Total da Conta */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                      Total: R$ {item.total_value?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    Minha Parte
                  </p>
                  <p
                    className={`font-black text-base ${item.is_paid ? "text-slate-400" : "text-green-600"}`}
                  >
                    R$ {item.share_amount.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDelete(item.expense_id, item.description)
                  }
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
