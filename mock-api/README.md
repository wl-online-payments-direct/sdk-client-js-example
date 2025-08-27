# Mock API for simulating a merchant server

This API uses the Worldline API testing environment (the same one as in
the [API explorer](https://explorer.direct.worldline-solutions.com))
via the Node.js SDK. It simulates the merchant's shop (or other similar system on the merchant side).

## First run

Before starting the API for the first time, do the following:

1. Create the `.env` file based on the `.env.example` file, and add your merchant's credentials.
2. Run `yarn` to install packages.

## Start the API

Run `yarn start` to start the API. It will start the API server at the address adn port specified in your `.env` file.

### Start parameters

There are two parameters to the start action: `delay` and `simulateError`.

#### Delay

Adds a delay to all API responses. The value is in milliseconds.
For example, to delay all responses for 200 ms, run `yarn start 200`.

#### Error 400 response

Makes 20% of API calls return error 400 response. The decision on which calls should return error 400 is random.
This can be used to test how the client will behave in such cases.
To do this, add `true` as the second argument of the start command: `yarn start 200 true`.
This will make approximately 20% of requests to have a 400 response.

**NOTE**: it has to be combined with the delay option. Put 0 as a delay to avoid delaying a response, e.g.
`yarn start 0 true`.
`yarn start` is equivalent to `yarn start 0 false`.

## HTTPS server and self-signed certificate

When starting the server for the first time, the code will generate a new self-signed certificate, and then use it to
start the `json-server` over https. Because the certificate is self-signed, the browsers will usually ask a user to
accept the risk and trust the certificate. Because of that, open the API URL in the browser and accept the risk before
calling the API in the client code. Be sure to do this every time the call to the server gives an error, which is
commonly wrongly interpreted as CORS error. You can detect it in the network panel of the dev tools in your browser.
