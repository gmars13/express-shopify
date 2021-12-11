import cors from 'cors'
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import fs from "fs";
import { Session } from "@shopify/shopify-api/dist/auth/session";
import Shopify, { ApiVersion } from "@shopify/shopify-api";

dotenv.config();

const port = process.env.PORT || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev
});

const handle = app.getRequestHandler();
const FILENAME = "./session.json";

function storeCallback(session) {
  console.log("storeCallback ");
  fs.writeFileSync(FILENAME, JSON.stringify(session));
  return true;
}

function loadCallback(id) {
  console.log("loadCallback ");

  if (fs.existsSync(FILENAME)) {
    const sessionResult = fs.readFileSync(FILENAME, "utf8");
    return Object.assign(new Session(), JSON.parse(sessionResult));
  }

  return false;
}

function deleteCallback(id) {
  console.log("deleteCallback", id);
}



const sessionStorage = new Shopify.Session.CustomSessionStorage(storeCallback, loadCallback, deleteCallback);
const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;
Shopify.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST.replace(/https:\/\//, ""),
    IS_EMBEDDED_APP: false,
    API_VERSION: ApiVersion.October20, // all supported versions are available, as well as "unstable" and "unversioned"
    SESSION_STORAGE: sessionStorage
});

const ACTIVE_SHOPIFY_SHOPS = {};
const session = loadCallback();
console.log("test1");

if (session?.shop && session?.scope) {
  console.log("session", session);
  ACTIVE_SHOPIFY_SHOPS[session.shop] = session.scope;
}


app.prepare().then(async () => {
    const server = new Koa();
    const router = new Router();
    server.keys = [Shopify.Context.API_SECRET_KEY];
    server.use(createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const {
          shop,
          accessToken,
          scope
        } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;
        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) => delete ACTIVE_SHOPIFY_SHOPS[shop]
        });
  
        if (!response.success) {
          console.log(`Failed to register APP_UNINSTALLED webhook: ${response.result}`);
        }
  
        // console.log("Start updating theme");
        // updateTheme(shop, accessToken); // Redirect to app with shop parameter upon auth
  
        ctx.redirect(`/?shop=${shop}`);
      }
  
    }));

    server.use(cors());
  
    const handleRequest = async ctx => {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    };
  
    router.get("/", async ctx => {
      const shop = ctx.query.shop; // This shop hasn't been seen yet, go through OAuth to create a session
  
      if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        ctx.redirect(`/auth?shop=${shop}`);
      } else {
        await handleRequest(ctx);
      }
    });
    router.post("/webhooks", async ctx => {
      console.log("webhooks");
  
      try {
        await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
        console.log(`Webhook processed, returned status code 200`);
      } catch (error) {
        console.log(`Failed to process webhook: ${error}`);
      }
    });
  
    async function injectSession(ctx, next) {
      const session = (await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res)) || loadCallback();
      console.log(session);
      ctx.sesionFromToken = session;
  
      if (session?.shop && session?.accessToken) {
        const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
        ctx.myClient = client;
      }
  
      return next();
    }
  
    router.get('/options', (ctx)=>{
        ctx.body = "test"
    })

    server.use(injectSession);
    // server.use(routes());
    router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  
    router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  
    router.get("(.*)", verifyRequest(), handleRequest); // Everything else must have sessions
  
    server.use(router.allowedMethods());
    server.use(router.routes());
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
});

// // const api_key = process.env.SHOPIFY_API_KEY;
// // const api_secret = process.env.SHOPIFY_API_SECRET;
// // const scopes = process.env.SCOPES;
// // const host = process.env.HOST;
// // let codes;



// // app.get('/shopify', (req, res) => {
// //     // console.log(req)
// //     // res.status(200).send("test")
// //     const { shop } = req.query;

// //     if(shop){
// //         const state = nonce();
// //         const redirect = `${host}/shopify/callback`;
// //         const installURL = `https://${shop}/admin/oauth/authorize?client_id=${api_key}&scope=${scopes}&state=${state}&redirect_uri=${redirect}`
// //         console.log(installURL)
// //         res.cookie('state', state);
// //         res.redirect(installURL)
// //     }
// //     else{
// //         res.status(400).send("missing shop parameter")
// //     }
// // })

// // app.get('/shopify/callback', (req, res)=>{
// //     const { shop, hmac, code, state } = req.query;
// //     codes = code
// //     const state_cookie = cookie.parse(req.headers.cookie).state;

// //     if(state !== state_cookie){
// //         return res.status(400).send("request origin not verified");
// //     }

// //     if(shop && hmac && code){
// //         const map = Object.assign({}, req.query);
// //         delete map['hmac'];
// //         const message = querystring.stringify(map)
// //         const generatedHash = crypto.createHmac('sha256', api_secret).update(message).digest('hex')

// //         if(generatedHash !== hmac){
// //             return res.status(400).send("hmac validation failed");
// //         }

// //     }

// //     res.status(200).send('HMAC validated');
// // })

// app.get('/options', (req, res) => {
//     // let { shop, signature } = req.query;
//     // console.log(codes)
//     // const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
//     // const accessTokenPayload = {
//     //     client_id: api_key,
//     //     client_secret: api_secret,
//     //     code : codes
//     // }

//     // request.post(accessTokenRequestUrl, {json: accessTokenPayload})
//     //     .then((acc_token) =>{
//     //         let {access_token} = acc_token
//     //         res.send(access_token)
//     //     })

//     res.send("test")
// })

// app.listen(port, ()=>{
//     console.log(`Listening on port ${port}`);
// });


