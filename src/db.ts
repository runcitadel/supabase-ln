import Supabase from "@supabase/supabase-js";

const supabase = Supabase.createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ADMIN_KEY as string
);

export function getFakeEmail(pubkey: string) {
  return `${pubkey}@usernodes.runcitadel.space`;
}

export async function addFakeUser(pubkey: string, password: string) {
  const mail = getFakeEmail(pubkey);
  const { data, error } = await supabase.auth.api.generateLink("signup", mail, {
    password,
  });
  if (error) throw new Error(error.message);
  return (data as unknown as { action_link: string }).action_link;
}

export async function loginFakeUser(pubkey: string) {
  const mail = getFakeEmail(pubkey);
  const { data, error } = await supabase.auth.api.generateLink(
    "magiclink",
    mail
  );
  if (error) throw new Error(error.message);
  return (data as unknown as { action_link: string }).action_link;
}
