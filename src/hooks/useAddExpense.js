import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useAddExpense() {
  const [isSaving, setIsSaving] = useState(false);

  const addExpense = async ({
    description,
    value,
    date,
    type,
    installments,
    selectedMembers,
    category = "other",
    onSuccess,
  }) => {
    const totalValue = parseFloat(value);
    const numInstallments =
      type === "parcelada" ? parseInt(installments) || 1 : 1;

    if (!description || !totalValue || selectedMembers.length === 0) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    setIsSaving(true);

    try {
      for (let i = 0; i < numInstallments; i++) {
        // Lógica de data robusta
        const currentDueDate = new Date(date + "T00:00:00");
        currentDueDate.setMonth(currentDueDate.getMonth() + i);

        const dateStr = currentDueDate.toISOString().split("T")[0];
        const displayDescription =
          type === "parcelada"
            ? `${description} (${i + 1}/${numInstallments})`
            : description;

        // 1. Inserir despesa
        const { data: expense, error: expError } = await supabase
          .from("expenses")
          .insert([
            {
              description: displayDescription,
              total_value: totalValue,
              due_date: dateStr,
              billing_month: dateStr.substring(0, 7) + "-01",
              type: type,
              category: category,
            },
          ])
          .select()
          .single();

        if (expError) throw expError;

        // 2. Inserir splits
        const share = (100 / selectedMembers.length).toFixed(2);
        const splits = selectedMembers.map((memberId) => ({
          expense_id: expense.id,
          profile_id: memberId,
          share_percentage: share,
        }));

        const { error: splitError } = await supabase
          .from("expense_splits")
          .insert(splits);
        if (splitError) throw splitError;
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return { addExpense, isSaving };
}
