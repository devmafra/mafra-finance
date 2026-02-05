import React, { useState, useEffect } from "react";
import { X, Save, Plus, Calendar, Hash } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useMembers } from "../hooks/useMembers";
import { useAddExpense } from "../hooks/useAddExpense";
import { CATEGORIES } from "../constants/categories";

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

  // Estados locais
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("recorrente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [installments, setInstallments] = useState(1);
  const [category, setCategory] = useState("other");

  useEffect(() => {
    if (isOpen) {
      if (editingBill) {
        setDescription(editingBill.description || "");
        setValue(editingBill.total_value || "");
        setDate(editingBill.due_date || "");
        setType(editingBill.type || "recorrente");
        setCategory(editingBill.category || "other");

        // --- NOVO: Buscar os membros atuais dessa conta ---
        const fetchCurrentMembers = async () => {
          const { data } = await supabase
            .from("expense_splits")
            .select("profile_id")
            .eq("expense_id", editingBill.id);

          if (data) {
            setSelectedMembers(data.map((split) => split.profile_id));
          }
        };
        fetchCurrentMembers();
      } else {
        // Reset para nova despesa
        setDescription("");
        setValue("");
        setType("recorrente");
        setDate(new Date().toISOString().split("T")[0]);
        setSelectedMembers([]);
        setInstallments(1);
        setCategory("other");
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
    // Validação básica
    if (!description || !value) {
      alert("Preencha a descrição e o valor.");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Selecione pelo menos um participante para o rateio.");
      return;
    }

    if (editingBill) {
      // --- LÓGICA DE EDIÇÃO ATUALIZADA ---
      setLocalSaving(true);
      try {
        // 1. Atualiza a conta principal (expenses)
        const { error: updateError } = await supabase
          .from("expenses")
          .update({
            description,
            total_value: parseFloat(value),
            due_date: date,
            category: category,
          })
          .eq("id", editingBill.id);

        if (updateError) throw updateError;

        // 2. REFAZ O RATEIO (SPLITS)
        // Primeiro: Remove os splits antigos (para evitar duplicatas ou sobras)
        const { error: deleteError } = await supabase
          .from("expense_splits")
          .delete()
          .eq("expense_id", editingBill.id);

        if (deleteError) throw deleteError;

        // Segundo: Cria os novos splits com os membros selecionados
        const sharePercentage = (100 / selectedMembers.length).toFixed(2);

        const newSplits = selectedMembers.map((memberId) => ({
          expense_id: editingBill.id,
          profile_id: memberId,
          share_percentage: sharePercentage,
          is_paid: false, // Ao reeditar o rateio, resetamos o status de pagamento por segurança
        }));

        const { error: insertError } = await supabase
          .from("expense_splits")
          .insert(newSplits);

        if (insertError) throw insertError;

        onRefresh();
        onClose();
      } catch (err) {
        console.error(err);
        alert("Erro ao atualizar: " + err.message);
      } finally {
        setLocalSaving(false);
      }
    } else {
      // --- LÓGICA DE CRIAÇÃO (MANTIDA) ---
      addExpense({
        description,
        value,
        date,
        type,
        installments,
        selectedMembers,
        category,
        onSuccess: () => {
          onRefresh();
          onClose();
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingBill ? "Editar Despesa" : "Nova Despesa"}
            </h2>
            <p className="text-xs text-slate-500">
              {editingBill
                ? "Ajuste valor, categoria ou participantes"
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
          {/* 1. SELETOR DE TIPO (Apenas na criação para não quebrar parcelas) */}
          {!editingBill && (
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              {["recorrente", "parcelada"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    if (t === "parcelada") setInstallments(2);
                    else setInstallments(1);
                  }}
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

          {/* 2. SELETOR DE CATEGORIA */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
              Categoria
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(CATEGORIES).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                      ${
                        isSelected
                          ? `${cat.color} ${cat.border} border-2 ring-1 ring-offset-1 ring-blue-100 scale-105`
                          : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                      }
                    `}
                  >
                    <Icon size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase truncate w-full text-center">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. INPUTS DE TEXTO E VALOR */}
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
                <span className="absolute left-3 top-4 text-slate-400 text-sm font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-mono font-medium"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={16}
                />
                <input
                  type="date"
                  className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none text-slate-600 text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 4. PARCELAS (Só aparece na criação parcelada) */}
          {!editingBill && type === "parcelada" && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 animate-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-yellow-700 mb-2 uppercase">
                Número de Parcelas
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-4 text-yellow-500"
                  size={16}
                />
                <input
                  type="number"
                  min="2"
                  max="48"
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value))}
                  className="w-full p-3 pl-9 bg-white border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-yellow-800 font-bold"
                />
              </div>
              <p className="text-[10px] text-yellow-600 mt-2">
                * Serão criadas <strong>{installments} contas</strong> mensais
                automaticamente.
              </p>
            </div>
          )}

          {/* 5. SELEÇÃO DE MEMBROS (Agora disponível na edição também) */}
          <div>
            <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-widest">
              Participantes do Rateio {editingBill && "(Editar)"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    selectedMembers.includes(m.id)
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {selectedMembers.includes(m.id) && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                  {m.full_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
