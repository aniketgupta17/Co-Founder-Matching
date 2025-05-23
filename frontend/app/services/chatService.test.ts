import { getSupabaseClient } from "../hooks/supabase";

const supabase = getSupabaseClient();

async function testCreatePrivateChatRPC() {
  const firstUserId = "05f14afc-c009-4943-8c6f-abbce56df036";
  const secondUserId = "080d0fda-47ef-4348-a17e-523579d45b95";

  const { data, error } = await supabase.rpc("create_private_chat", {
    _first_user_id: firstUserId,
    _second_user_id: secondUserId,
  });

  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
}

testCreatePrivateChatRPC();
