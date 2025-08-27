# [Vite](https://vitejs.dev) Online Payments Client SDK Example with ESM

### What is it?

This example shows you how to load the Online Payments JavaScript Client SDK with
[Vite](https://vitejs.dev/guide/features.html) as an ESM module.

The Online Payments SDK is used for all communication to the Online Payments API and crypto.

### How to install

Make sure you have installed [Node.js](https://nodejs.org/en/); the LTS version is recommended. Run

```bash
npm install
```

or

```bash
yarn install
```

### How to start the payment process

Create a client session identifier and a customer identifier, which the Client API needs for authentication purposes.
These can be obtained by your e-commerce server using the Server SDKs or directly using the Server API.
Use this information along with the geographical region of the Client API you want to direct to and the payment details
to start the process. If you incorporate this into your production process, all this information should be used to
initialize the payment process.

Create an environment file `.env` with the following variable names:

```dotenv
VITE_ASSET_URL="xxx"
VITE_CLIENT_API_URL="xxx"
VITE_CLIENT_SESSION_ID="xxx"
VITE_CUSTOMER_ID="xxx"
```

Replace `xxx` with correct values from the session details.
Once these env variables are set, you'll be able to start Vite dev-server by running the command:

```bash
npm run start
```

or

```bash
yarn start
```
