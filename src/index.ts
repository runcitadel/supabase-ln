import Koa from "koa";
import Router from "@koa/router";
import koaBody from "koa-body";
import cors from "@koa/cors";
import dotenv from "dotenv";
dotenv.config();
import * as ln from "./lightning.js";

const koa = new Koa();
const router = new Router();
router.use(cors({
  allowMethods: 'POST,OPTIONS'
}));
router.use(koaBody());

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ADMIN_KEY) {
  console.error("SUPABASE_URL or SUPABASE_ADMIN_KEY missing!");
  process.exit(1);
}

router.get("/message", async (ctx, next) => {
  ctx.body = {
    msg: ln.getMessage(),
  };
  await next();
});

router.post("/signup", async (ctx, next) => {
  const body = ctx.request.body as Record<string, unknown> | undefined;
  if (
    !body ||
    typeof body?.signature !== "string" ||
    typeof body?.password !== "string"
  )
    ctx.throw(400);
  else
    ctx.body = {
      link: await ln.signUpFromSignature(body.signature, body.password),
    };
  await next();
});

router.post("/login", async (ctx, next) => {
  const body = ctx.request.body as Record<string, unknown> | undefined;
  if (!body || typeof body?.signature !== "string") ctx.throw(400);
  else
    ctx.body = {
      link: await ln.loginFromSignature(body.signature),
    };
  await next();
});

koa.use(router.routes());
koa.use(router.allowedMethods());
koa.listen(process.env.PORT || 3000);
