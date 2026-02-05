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
    const totalInput = parseFloat(value);

    // Validação básica
    if (!description || !totalInput || selectedMembers.length === 0) {
      alert("Preencha descrição, valor e participantes!");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Pega o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 2. Define parcelas
      const numInstallments =
        type === "parcelada" ? parseInt(installments) || 2 : 1;

      // 3. Calcula o valor de cada parcela (Valor Total / Num Parcelas)
      const valuePerInstallment =
        type === "parcelada" ? totalInput / numInstallments : totalInput;

      // 4. Calcula a porcentagem de divisão (Isso é igual para todas as parcelas)
      // Ex: 2 pessoas = 50.00
      const sharePercentage = (100 / selectedMembers.length).toFixed(2);

      // LOOP DE CRIAÇÃO
      for (let i = 0; i < numInstallments; i++) {
        // Ajusta Data
        const currentDueDate = new Date(date);
        currentDueDate.setDate(currentDueDate.getDate() + 1); // Compensação Fuso
        currentDueDate.setMonth(currentDueDate.getMonth() + i);

        const dateStr = currentDueDate.toISOString().split("T")[0];
        const billingMonth = dateStr.substring(0, 7) + "-01"; // "2026-02-01"

        // Descrição
        const displayDescription =
          type === "parcelada"
            ? `${description} (${i + 1}/${numInstallments})`
            : description;

        // A. INSERE A DESPESA
        const { data: expense, error: expError } = await supabase
          .from("expenses")
          .insert([
            {
              description: displayDescription,
              total_value: valuePerInstallment,
              due_date: dateStr,
              billing_month: billingMonth,
              type: type,
              category: category,
              created_by: user.id,
            },
          ])
          .select()
          .single();

        if (expError) throw expError;

        // B. INSERE OS RATEIOS (SPLITS) - CORRIGIDO AQUI
        const splits = selectedMembers.map((memberId) => ({
          expense_id: expense.id,
          profile_id: memberId,
          share_percentage: sharePercentage, // <--- Voltamos a usar porcentagem
          is_paid: false,
        }));

        const { error: splitError } = await supabase
          .from("expense_splits")
          .insert(splits);

        if (splitError) throw splitError;
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return { addExpense, isSaving };
}
