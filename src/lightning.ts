import Lightning, { type CheckmessageResponse } from "@core-ln/core";
import * as db from "./db.js";

const ln = new Lightning(process.env.CORE_LN_SOCKET || "/c-lightning/rpc");

export function getMessage() {
  return "Login for Citadel accounts. Do not sign this message if you are not trying to login on account.runcitadel.space. We never ask you to sign this via chat/email.";
}

export async function verifyMessage(zbase: string) {
  return await ln.checkmessage({
    message: getMessage(),
    zbase,
  });
}

export async function signUpFromSignature(zbase: string, password: string) {
  let validationResult: CheckmessageResponse;
  try {
    validationResult = await verifyMessage(zbase);
  } catch {
    throw new Error("Invalid signature!");
  }
  if (!validationResult.verified) throw new Error("Invalid signature");
  try {
    return db.addFakeUser(validationResult.pubkey as string, password);
  } catch {
    throw new Error("User already exists!");
  }
}

export async function loginFromSignature(zbase: string) {
  let validationResult: CheckmessageResponse;
  try {
    validationResult = await verifyMessage(zbase);
  } catch {
    throw new Error("Invalid signature!");
  }
  if (!validationResult.verified) throw new Error("Invalid signature");
  try {
    return db.loginFakeUser(validationResult.pubkey as string);
  } catch {
    throw new Error("User doesn't exists!");
  }
}
