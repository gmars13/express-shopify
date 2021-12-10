const dotenv = require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');

const app = express();
const port = process.env.PORT || 8081;

const api_key = process.env.SHOPIFY_API_KEY;
const api_secret = process.env.SHOPIFY_API_SECRET;
const scopes = process.env.SCOPES;
const host = process.env.HOST;

app.get('/shopify', (req, res) => {
    // console.log(req)
    // res.status(200).send("test")
    const { shop } = req.query;

    if(shop){
        const state = nonce();
        const redirect = `${host}/shopify/callback`;
        const installURL = `https://${shop}/admin/oauth/authorize?client_id=${api_key}&scope=${scopes}&state=${state}&redirect_uri=${redirect}`
        console.log(installURL)
        res.cookie('state', state);
        res.redirect(installURL)
    }
    else{
        res.status(400).send("missing shop parameter")
    }
})

app.get('/shopify/callback', (req, res)=>{
    const { shop, hmac, code, state } = req.query;
    const state_cookie = cookie.parse(req.headers.cookie).state;

    if(state !== state_cookie){
        return res.status(400).send("request origin not verified");
    }

    if(shop && hmac && code){
        const map = Object.assign({}, req.query);
        delete map['hmac'];
        const message = querystring.stringify(map)
        const generatedHash = crypto.createHmac('sha256', api_secret).update(message).digest('hex')

        if(generatedHash !== hmac){
            return res.status(400).send("hmac validation failed");
        }
    }

    res.status(200).send('HMAC validated');
})

app.get('/options', (req, res) => {
    let { shop } = req.query;

    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
        client_id: api_key,
        client_secret: api_secret,
    }

    request.post(accessTokenRequestUrl, {json: accessTokenPayload})
        .then((acc_token) =>{
            let {access_token} = acc_token
            res.send(access_token)
        })
})

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});


