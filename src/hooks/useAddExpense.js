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

    if (!description || !totalInput || selectedMembers.length === 0) {
      alert("Preencha descrição, valor e participantes!");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Pega o usuário logado e seu PERFIL (para ter family_id e house_id)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // BUSCA OS DADOS DE HIERARQUIA DO PERFIL
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id, house_id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile.family_id || !profile.house_id) {
        throw new Error(
          "Você precisa estar em uma família para lançar despesas.",
        );
      }

      // 2. Define parcelas
      const numInstallments =
        type === "parcelada" ? parseInt(installments) || 2 : 1;
      const valuePerInstallment =
        type === "parcelada" ? totalInput / numInstallments : totalInput;
      const sharePercentage = (100 / selectedMembers.length).toFixed(2);

      // LOOP DE CRIAÇÃO
      for (let i = 0; i < numInstallments; i++) {
        const currentDueDate = new Date(date);
        currentDueDate.setDate(currentDueDate.getDate() + 1);
        currentDueDate.setMonth(currentDueDate.getMonth() + i);

        const dateStr = currentDueDate.toISOString().split("T")[0];
        const billingMonth = dateStr.substring(0, 7) + "-01";

        const displayDescription =
          type === "parcelada"
            ? `${description} (${i + 1}/${numInstallments})`
            : description;

        // A. INSERE A DESPESA COM OS NOVOS CAMPOS
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
              // --- VÍNCULOS DE HIERARQUIA ---
              family_id: profile.family_id,
              house_id: profile.house_id,
            },
          ])
          .select()
          .single();

        if (expError) throw expError;

        // B. INSERE OS RATEIOS (SPLITS)
        const splits = selectedMembers.map((memberId) => ({
          expense_id: expense.id,
          profile_id: memberId,
          share_percentage: sharePercentage,
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
