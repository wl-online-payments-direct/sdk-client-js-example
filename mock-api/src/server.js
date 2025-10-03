/* eslint-disable */
import path from 'path';
import fs from 'fs';
import https from 'https';
import jsonServer from 'json-server';
import dotenv from 'dotenv';
import { setup } from './config.js';
import { setRoutes } from './routes.js';

dotenv.config();
setup();

const keyFile = path.resolve('./cert/cert.key');
const certFile = path.resolve('./cert/cert.pem');

const server = jsonServer.create();

server.use(jsonServer.bodyParser);

server.use(function (req, res, next) {
    const allowedDomain = /^(https?:\/\/localhost:)/.test(req.get('origin'))
        ? req.get('origin')
        : 'https://dummyDomain.dev';

    res.setHeader('Access-Control-Allow-Origin', allowedDomain);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
});

const delay = process.argv.length > 2 ? Number(process.argv[2]) : false;
const with400 = process.argv.length > 3 ? process.argv[3] === 'true' : false;

server.use(function (req, res, next) {
    if (req.method !== 'OPTIONS' && delay) {
        setTimeout(next, delay);
    } else {
        next();
    }
});

server.use(function (req, res, next) {
    if (req.method !== 'OPTIONS' && with400 && Math.random() > 0.8) {
        res.status(400).json();
    } else {
        next();
    }
});

setRoutes(server);

/** Default route handler */
server.use((req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

const baseUrl = process.env.API_URL || 'localhost';
const port = Number(process.env.API_PORT || 5777);
const apiUrl = `https://${baseUrl}:${port}/`;

// server
//     .listen(port, baseUrl, () => {
//         console.log('API URL ' + apiUrl);
//         delay && console.log(`API responses will be delayed for ${delay}ms.`);
//         with400 && console.log(`20% of API responses will result in error 400.`);
//     });
https
    .createServer(
        {
            key: fs.readFileSync(keyFile),
            cert: fs.readFileSync(certFile)
        },
        server
    )
    .listen(port, baseUrl, () => {
        console.log('API URL ' + apiUrl);
        delay && console.log(`API responses will be delayed for ${delay}ms.`);
        with400 && console.log(`20% of API responses will result in error 400.`);
    });
