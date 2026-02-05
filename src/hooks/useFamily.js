import { supabase } from "../lib/supabase";

export function useFamily() {
  // 1. Criar uma nova família e já vincular o usuário a ela
  const createFamily = async (userId, familyName) => {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Cria a família
    const { data: family, error: famError } = await supabase
      .from("families")
      .insert([{ name: familyName, join_code: joinCode }])
      .select()
      .single();

    if (famError) throw famError;

    // Vincula o perfil do usuário a essa nova família
    const { error: profError } = await supabase
      .from("profiles")
      .update({ family_id: family.id })
      .eq("user_id", userId);

    if (profError) throw profError;

    return { family, joinCode };
  };

  // 2. Entrar em uma família existente via Código
  const joinFamily = async (userId, code) => {
    const { data: family, error: famError } = await supabase
      .from("families")
      .select("id")
      .eq("join_code", code.toUpperCase())
      .single();

    if (famError) throw new Error("Código de família inválido.");

    const { error: profError } = await supabase
      .from("profiles")
      .update({ family_id: family.id })
      .eq("user_id", userId);

    if (profError) throw profError;

    return family;
  };

  return { createFamily, joinFamily };
}
