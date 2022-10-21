import Lightning, { type CheckmessageResponse } from "https://deno.land/x/core_ln@v0.3.4/mod.ts";
import * as db from "./db.ts";

const ln = new Lightning(Deno.env.get("CORE_LN_SOCKET") || "/c-lightning/rpc");

export function getMessage(previous = false) {
  let text = `Login for Citadel accounts. Do not sign this message if you are not trying to login on account.runcitadel.space or the Citadel TLS app. We never ask you to sign this via chat/email.`;
  // Increment time every 10 minutes
  let time = Math.floor(Date.now() / 1000 / 60 / 10);
  if (previous) {
    time -= 1;
  }
  // Add a hint on when this will expire
  text += ` This message is valid until ${new Date((time + 1) * 1000 * 60 * 10).toLocaleString()}.`;
  return text;
}

export async function verifyMessage(zbase: string) {
    try {
      const response = await ln.checkmessage({
        message: getMessage(),
        zbase,
      });
      if (!response.verified) {
        throw new Error();
      }
      return response;
  } catch {
    // Also allow previous message
    return await ln.checkmessage({
      message: getMessage(true),
      zbase,
    });
  }
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
