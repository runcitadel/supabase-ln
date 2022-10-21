import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import * as ln from "./lightning.ts";

const app = new Application();
const router = new Router();
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Headers", "*")
  await next();
});

if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_ADMIN_KEY")) {
  console.error("SUPABASE_URL or SUPABASE_ADMIN_KEY missing!");
  Deno.exit(1);
}

router.get("/message", async (ctx, next) => {
  ctx.response.body = {
    msg: ln.getMessage(),
  };
  await next();
});

router.post("/signup", async (ctx, next) => {
  const body = await ctx.request.body({
    type: "json",
  }).value;
  if (
    !body ||
    typeof body.signature !== "string" ||
    typeof body?.password !== "string"
  )
    ctx.throw(400);
  else
    ctx.response.body = {
      link: await ln.signUpFromSignature(body.signature, body.password, body.redirectTo),
    };
  await next();
});

router.post("/login", async (ctx, next) => {
  const body = await ctx.request.body({
    type: "json",
  }).value;
  if (!body || typeof body?.signature !== "string") ctx.throw(400);
  else
    ctx.response.body = {
      link: await ln.loginFromSignature(body.signature, body.redirectTo),
    };
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen({
  port: parseInt(Deno.env.get("PORT")!) || 3000,
});
