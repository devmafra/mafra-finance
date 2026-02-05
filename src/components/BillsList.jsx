import React from "react";
import { Trash2, CheckCircle, Circle, Calendar, Pencil } from "lucide-react";
import { supabase } from "../lib/supabase";
import { format, parseISO, isPast, isToday } from "date-fns";
import { CATEGORIES } from "../constants/categories"; // <--- 1. Importei aqui

export function BillsList({ loading, data, onRefresh, myUserId, onEdit }) {
  // Filtramos apenas o que pertence ao usuário logado
  const myShares = data.filter((item) => item.user_id === myUserId);

  async function handleDelete(expenseId, description) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a conta "${description}"? Isso apagará o registro para todos os participantes.`,
    );

    if (confirmed) {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) {
        alert("Erro ao deletar: " + error.message);
      } else {
        onRefresh();
      }
    }
  }

  async function togglePayment(expenseId, profileId, currentStatus) {
    const { error } = await supabase
      .from("expense_splits")
      .update({
        is_paid: !currentStatus,
        paid_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq("expense_id", expenseId)
      .eq("profile_id", profileId);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
    } else {
      onRefresh();
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <span className="font-semibold text-slate-700">
          Minhas Despesas do Mês
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {myShares.length} {myShares.length > 1 ? "contas" : "conta"}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-green-600 mb-4"></div>
            <p className="text-slate-500 text-sm animate-pulse">
              Carregando...
            </p>
          </div>
        ) : myShares.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            Nenhuma conta cadastrada para este mês.
          </div>
        ) : (
          myShares.map((item) => {
            const dueDate = parseISO(item.due_date);
            const isOverdue =
              isPast(dueDate) && !isToday(dueDate) && !item.is_paid;

            // --- 2. Resolvemos a Categoria e o Ícone ---
            // Se não tiver categoria salva, usa 'other'
            const categoryConfig =
              CATEGORIES[item.category] || CATEGORIES.other;
            const CategoryIcon = categoryConfig.icon;

            return (
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
                    className={`transition-colors ${
                      item.is_paid
                        ? "text-green-500"
                        : "text-slate-300 hover:text-amber-500"
                    }`}
                  >
                    {item.is_paid ? (
                      <CheckCircle size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  {/* --- 3. Renderizamos o Ícone Colorido Aqui --- */}
                  <div
                    className={`p-2.5 rounded-xl ${categoryConfig.color} bg-opacity-50 hidden sm:block`}
                  >
                    <CategoryIcon size={20} />
                  </div>

                  <div>
                    <p
                      className={`font-bold text-sm ${
                        item.is_paid
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Ícone pequeno para mobile se quiser, ou mantém só no desktop acima */}

                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                        Total: R$ {item.expense_total?.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                          item.is_paid
                            ? "bg-slate-100 text-slate-400"
                            : isOverdue
                              ? "bg-red-100 text-red-600 animate-pulse"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Calendar size={10} />
                        Venc: {format(dueDate, "dd/MM")}
                        {isOverdue && " (Atrasada)"}
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
                      className={`font-black text-base ${
                        item.is_paid
                          ? "text-slate-400"
                          : isOverdue
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      R$ {item.share_amount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botão Editar */}
                    <button
                      onClick={() =>
                        onEdit({
                          id: item.expense_id,
                          description: item.description,
                          total_value: item.expense_total,
                          due_date: item.due_date,
                          type: item.type,
                          category: item.category, // <--- 4. Passamos a categoria para o modal de edição
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar conta"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.expense_id, item.description)
                      }
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir conta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
