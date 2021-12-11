"use strict";

var _cors = _interopRequireDefault(require("cors"));

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _shopifyApi = _interopRequireWildcard(require("@shopify/shopify-api"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const dotenv = require('dotenv').config();
// const express = require('express');
// const crypto = require('crypto');
// const cookie = require('cookie');
// const nonce = require('nonce')();
// const querystring = require('querystring');
// const request = require('request-promise');
// const cors = require('cors');
// const Shopify = require('shopify-api')
var app = (0, _express.default)();

_dotenv.default.config();

app.use((0, _cors.default)());
var port = process.env.PORT || 8081;
var {
  API_KEY,
  API_SECRET_KEY,
  SCOPES,
  SHOP,
  HOST
} = process.env;

_shopifyApi.default.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST.replace(/https:\/\//, ""),
  IS_EMBEDDED_APP: false,
  API_VERSION: _shopifyApi.ApiVersion.October20 // all supported versions are available, as well as "unstable" and "unversioned"

}); // const api_key = process.env.SHOPIFY_API_KEY;
// const api_secret = process.env.SHOPIFY_API_SECRET;
// const scopes = process.env.SCOPES;
// const host = process.env.HOST;
// let codes;
// app.get('/shopify', (req, res) => {
//     // console.log(req)
//     // res.status(200).send("test")
//     const { shop } = req.query;
//     if(shop){
//         const state = nonce();
//         const redirect = `${host}/shopify/callback`;
//         const installURL = `https://${shop}/admin/oauth/authorize?client_id=${api_key}&scope=${scopes}&state=${state}&redirect_uri=${redirect}`
//         console.log(installURL)
//         res.cookie('state', state);
//         res.redirect(installURL)
//     }
//     else{
//         res.status(400).send("missing shop parameter")
//     }
// })
// app.get('/shopify/callback', (req, res)=>{
//     const { shop, hmac, code, state } = req.query;
//     codes = code
//     const state_cookie = cookie.parse(req.headers.cookie).state;
//     if(state !== state_cookie){
//         return res.status(400).send("request origin not verified");
//     }
//     if(shop && hmac && code){
//         const map = Object.assign({}, req.query);
//         delete map['hmac'];
//         const message = querystring.stringify(map)
//         const generatedHash = crypto.createHmac('sha256', api_secret).update(message).digest('hex')
//         if(generatedHash !== hmac){
//             return res.status(400).send("hmac validation failed");
//         }
//     }
//     res.status(200).send('HMAC validated');
// })


app.get('/options', (req, res) => {
  // let { shop, signature } = req.query;
  // console.log(codes)
  // const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  // const accessTokenPayload = {
  //     client_id: api_key,
  //     client_secret: api_secret,
  //     code : codes
  // }
  // request.post(accessTokenRequestUrl, {json: accessTokenPayload})
  //     .then((acc_token) =>{
  //         let {access_token} = acc_token
  //         res.send(access_token)
  //     })
  res.send("test");
});
app.listen(port, () => {
  console.log("Listening on port ".concat(port));
});
