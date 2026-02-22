import { supabase } from "../lib/supabase";

export function useFamily() {
  // 1. Criação Inicial (Admin cria Casa + Primeira Família)
  const createHouseAndFamily = async (userId, houseName, familyName) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // Cria a Casa
      const { data: house, error: hError } = await supabase
        .from("houses")
        .insert([{ name: houseName }])
        .select()
        .single();
      if (hError) throw hError;

      // Cria a Família vinculada à Casa
      const { data: family, error: fError } = await supabase
        .from("families")
        .insert([
          {
            name: familyName,
            house_id: house.id,
            invite_code: inviteCode,
          },
        ])
        .select()
        .single();
      if (fError) throw fError;

      // Vincula o usuário como ADMIN
      const { error: profError } = await supabase
        .from("profiles")
        .update({
          house_id: house.id,
          family_id: family.id,
          role: "admin",
        })
        .eq("user_id", userId);

      if (profError) throw profError;

      return { family, inviteCode };
    } catch (error) {
      console.error("Erro na criação:", error);
      throw error;
    }
  };

  // 2. Entrar em uma família existente via Código
  const joinFamily = async (userId, code) => {
    try {
      const { data: family, error: famError } = await supabase
        .from("families")
        .select("id, house_id")
        .eq("invite_code", code.toUpperCase())
        .single();

      if (famError || !family) throw new Error("Código de convite inválido.");

      const { data: leader } = await supabase
        .from("profiles")
        .select("id")
        .eq("family_id", family.id)
        .eq("role", "leader")
        .maybeSingle();

      const assignedRole = leader ? "member" : "leader";

      const { error: profError } = await supabase
        .from("profiles")
        .update({
          family_id: family.id,
          house_id: family.house_id,
          role: assignedRole,
        })
        .eq("user_id", userId);

      if (profError) throw profError;
      return family;
    } catch (error) {
      throw error;
    }
  };

  // 3. Adicionar Nova Família (Para o Painel do Admin)
  const addFamilyToHouse = async (houseId, familyName) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: family, error } = await supabase
      .from("families")
      .insert([
        {
          name: familyName,
          house_id: houseId,
          invite_code: inviteCode,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return family;
  };

  // 4. Sair da família
  const leaveFamily = async (userId) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        family_id: null,
        house_id: null,
        role: "member",
      })
      .eq("user_id", userId);

    if (error) throw error;
  };

  return { createHouseAndFamily, joinFamily, addFamilyToHouse, leaveFamily };
}
