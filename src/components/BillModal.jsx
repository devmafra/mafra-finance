import React, { useState, useEffect } from "react";
import { X, Save, Plus, Calendar, Calculator } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useMembers } from "../hooks/useMembers";
import { useAddExpense } from "../hooks/useAddExpense";

export function BillModal({
  isOpen,
  onClose,
  editingBill,
  onRefresh,
  myUserId,
}) {
  const members = useMembers();
  const { addExpense, isSaving } = useAddExpense();
  const [localSaving, setLocalSaving] = useState(false);

  // Estados locais de controle do formulário
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("recorrente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (isOpen) {
      if (editingBill) {
        setDescription(editingBill.description || "");
        setValue(editingBill.total_value || "");
        setDate(editingBill.due_date || "");
        setType(editingBill.type || "recorrente");
        // Nota: se precisar editar os membros no rateio,
        // precisaríamos buscar os IDs na tabela expense_splits
      } else {
        // Reset para nova despesa
        setDescription("");
        setValue("");
        setType("recorrente");
        setDate(new Date().toISOString().split("T")[0]);
        setSelectedMembers([]);
        setInstallments(1);
      }
    }
  }, [isOpen, editingBill]);

  if (!isOpen) return null;

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (editingBill) {
      // --- LÓGICA DE EDIÇÃO ---
      setLocalSaving(true);
      try {
        const { error } = await supabase
          .from("expenses")
          .update({
            description,
            total_value: parseFloat(value),
            due_date: date,
            created_by: myUserId,
          })
          .eq("id", editingBill.id)
          .select();

        if (error) throw error;

        onRefresh();
        onClose();
      } catch (err) {
        alert("Erro ao atualizar: " + err.message);
      } finally {
        setLocalSaving(false);
      }
    } else {
      // --- LÓGICA DE CRIAÇÃO (Já existente) ---
      addExpense({
        description,
        value,
        date,
        type,
        installments,
        selectedMembers,
        onSuccess: () => {
          onRefresh();
          onClose();
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingBill ? "Editar Despesa" : "Nova Despesa"}
            </h2>
            <p className="text-xs text-slate-500">
              {editingBill
                ? "Ajuste os detalhes da conta"
                : "Cadastre uma conta para rateio"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Seletor de Tipo (Desabilitado na edição por segurança de integridade) */}
          {!editingBill && (
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              {["recorrente", "parcelada"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                    type === t
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Descrição (ex: Aluguel, Luz...)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-4 text-slate-400 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <input
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none text-slate-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Rateio (Escondido na edição simples para evitar conflito de parcelas) */}
          {!editingBill && (
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-widest">
                Participantes do Rateio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedMembers.includes(m.id)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-green-300"
                    }`}
                  >
                    {m.full_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button
            disabled={isSaving || localSaving}
            onClick={handleSave}
            className={`flex-1 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              editingBill
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                : "bg-green-600 hover:bg-green-700 shadow-green-100"
            }`}
          >
            {isSaving || localSaving ? (
              "Processando..."
            ) : (
              <>
                {editingBill ? <Save size={20} /> : <Plus size={20} />}
                {editingBill ? "Salvar Alterações" : "Criar Despesa"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
