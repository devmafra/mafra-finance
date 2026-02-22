import { supabase } from "../lib/supabase";

export function useFamily() {
  // 1. Criar uma nova família (e uma Casa, se for o primeiro acesso)
  const createFamily = async (userId, familyName) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // Primeiro, verificamos se o usuário já tem uma house_id vinculada
      const { data: profile } = await supabase
        .from("profiles")
        .select("house_id, full_name")
        .eq("user_id", userId)
        .single();

      let currentHouseId = profile?.house_id;

      // Se não tem casa, criamos a "Casa de [Nome]"
      if (!currentHouseId) {
        const { data: newHouse, error: houseError } = await supabase
          .from("houses")
          .insert([{ name: `Casa de ${profile?.full_name || "Família"}` }])
          .select()
          .single();

        if (houseError) throw houseError;
        currentHouseId = newHouse.id;
      }

      // Criar a família vinculada à Casa
      const { data: family, error: famError } = await supabase
        .from("families")
        .insert([
          {
            name: familyName,
            invite_code: inviteCode,
            house_id: currentHouseId,
          },
        ])
        .select()
        .single();

      if (famError) throw famError;

      // Atualiza o perfil: Vincula à família, à casa e define como Admin (ou Leader)
      // Se ele criou a casa agora, ele é o Admin.
      const { error: profError } = await supabase
        .from("profiles")
        .update({
          family_id: family.id,
          house_id: currentHouseId,
          role: profile?.house_id ? "leader" : "admin",
        })
        .eq("user_id", userId);

      if (profError) throw profError;

      return { family, inviteCode };
    } catch (error) {
      console.error("Erro ao criar família/casa:", error);
      throw error;
    }
  };

  // 2. Entrar em uma família existente via Código (Herda a Casa automaticamente)
  const joinFamily = async (userId, code) => {
    // Busca a família pelo código de convite
    const { data: family, error: famError } = await supabase
      .from("families")
      .select("id, house_id")
      .eq("invite_code", code.toUpperCase())
      .single();

    if (famError || !family) throw new Error("Código de convite inválido.");

    // Verifica se a família já tem um líder para definir o role do novo membro
    const { data: leader } = await supabase
      .from("profiles")
      .select("id")
      .eq("family_id", family.id)
      .eq("role", "leader")
      .maybeSingle();

    const assignedRole = leader ? "member" : "leader";

    // O pulo do gato: atualiza family_id E house_id ao mesmo tempo
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
  };

  const leaveFamily = async (userId) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        family_id: null,
        house_id: null,
        role: "member", // Reseta para member padrão ao sair
      })
      .eq("user_id", userId);

    if (error) throw error;
  };

  return { createFamily, joinFamily, leaveFamily };
}
