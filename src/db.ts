import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ADMIN_KEY")!
);

export function getFakeEmail(pubkey: string) {
  return `${pubkey}@usernodes.runcitadel.space`;
}

export async function addFakeUser(pubkey: string, password: string, redirectTo?: string) {
  const mail = getFakeEmail(pubkey);
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email: mail,
    password,
    options: {
      redirectTo: redirectTo || "https://account.runcitadel.space",
    },
  });
  if (error) throw new Error(error.message);
  return data.properties.action_link;
}

export async function loginFakeUser(pubkey: string, redirectTo?: string) {
  const mail = getFakeEmail(pubkey);
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: mail,
    options: {
      redirectTo: redirectTo || "https://account.runcitadel.space",
    },
  });
  if (error) throw new Error(error.message);
  return data.properties.action_link;
}
