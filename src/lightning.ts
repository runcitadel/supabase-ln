import Lightning, { type CheckmessageResponse } from "https://deno.land/x/core_ln@v0.3.4/mod.ts";
import * as db from "./db.ts";

const ln = new Lightning(Deno.env.get("CORE_LN_SOCKET") || "/c-lightning/rpc");

export function getMessage() {
  return "Login for Citadel accounts. Do not sign this message if you are not trying to login on account.runcitadel.space. We never ask you to sign this via chat/email.";
}

export async function verifyMessage(zbase: string) {
  return await ln.checkmessage({
    message: getMessage(),
    zbase,
  });
}

export async function signUpFromSignature(zbase: string, password: string, redirectTo?: string) {
  let validationResult: CheckmessageResponse;
  try {
    validationResult = await verifyMessage(zbase);
  } catch {
    throw new Error("Invalid signature!");
  }
  if (!validationResult.verified) throw new Error("Invalid signature");
  try {
    return db.addFakeUser(validationResult.pubkey as string, password, redirectTo);
  } catch {
    throw new Error("User already exists!");
  }
}

export async function loginFromSignature(zbase: string, redirectTo?: string) {
  let validationResult: CheckmessageResponse;
  try {
    validationResult = await verifyMessage(zbase);
  } catch {
    throw new Error("Invalid signature!");
  }
  if (!validationResult.verified) throw new Error("Invalid signature");
  try {
    return db.loginFakeUser(validationResult.pubkey as string, redirectTo);
  } catch {
    throw new Error("User doesn't exists!");
  }
}
