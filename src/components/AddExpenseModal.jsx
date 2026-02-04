import React, { useState } from "react";
import { X, Plus, Calculator } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useMembers } from "../hooks/useMembers";

export function AddExpenseModal({ isOpen, onClose, onRefresh }) {
  const members = useMembers();
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("recorrente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  if (!isOpen) return null;

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const totalValue = parseFloat(value);
    if (!description || !totalValue || selectedMembers.length === 0) {
      alert("Preencha tudo e selecione ao menos uma pessoa!");
      return;
    }

    // 1. Criar a despesa
    const { data: expense, error: expError } = await supabase
      .from("expenses")
      .insert([
        {
          description,
          total_value: totalValue,
          due_date: date,
          billing_month: date.substring(0, 7) + "-01", // Garante o 1º dia do mês
          type: "recorrente",
        },
      ])
      .select()
      .single();

    if (expError) return alert("Erro ao criar despesa");

    // 2. Criar os splits (divisão igualitária automática)
    const share = (100 / selectedMembers.length).toFixed(2);
    const splits = selectedMembers.map((memberId) => ({
      expense_id: expense.id,
      profile_id: memberId,
      share_percentage: share,
    }));

    const { error: splitError } = await supabase
      .from("expense_splits")
      .insert(splits);

    if (splitError) alert("Erro nos splits");
    else {
      onRefresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Nova Despesa</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full"
          >
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Descrição (ex: Luz)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Valor total (R$)"
              className="p-3 border rounded-lg outline-none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <input
              type="date"
              className="p-3 border rounded-lg outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block uppercase tracking-tight">
              Quem vai pagar?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedMembers.includes(m.id)
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Salvar Despesa
          </button>
        </div>
      </div>
    </div>
  );
}
