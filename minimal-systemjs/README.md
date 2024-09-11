# systemjs Online Payments Client SDK Example

🚨 Please note that this example is only compatible with SDK versions up to major version 2.
To see how to include version 3+, please refer to the minimal vite-esm or webpack example.

## What is it?

This example shows you how to load the Online Payments JavaScript Client SDK with the systemjs module loader.

The Online Payments SDK is used for all communication to the Online Payments API and crypto.

## How to install

Make sure you have installed [Node.js](https://nodejs.org/en/); the LTS version is recommended. Run

    npm install

## How to start the payment process

Create a client session identifier and a customer identifier, which the Client API needs for authentication purposes.  
These can be obtained by your e-commerce server using the Server SDKs or directly using the Server API. Use this information along with the geographical region of the Client API you want to direct to and the payment details to start the process.  
If you incorporate this into your production process all this information should be used to initialize the payment process.

In `app.js` you include the sessiondetails, this is the only file that is systemjs specific. See `create-payload.js` on how to set-up the actual payment request which is the same for all module loaders.

### Folder structure

```
+-- js
|   -- app.js - the example app itself
|   -- create-payload.js - generic code which provides an example on how the SDK works, this is common for all minimal examples.
+-- node_modules
|   ... folder containing all node dependencies; run npm install to get the dependencies
|   -- index.html - html page as start page
```
