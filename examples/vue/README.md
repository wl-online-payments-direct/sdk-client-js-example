# Vue Online Payments Client SDK Example

## What is it?

This application is a Vue demonstration of the Online Payments client SDK.
You can use this application as a base for your own integrated Online Payments-powered payment solution.

The Vue Client SDK is used for all communication to the Online Payments API and crypto.
A simple webserver is included to make this application easy to install and run in development environments.

## How to install

Make sure you have installed [Node.js](https://nodejs.org/en/); the LTS version is recommended and yarn package manager.
Run

```bash
yarn
```

This example application shares the design with other examples. When you install packages, the base designs and
resources will be copied to this example app.

## Environment variables

The application has several environment variables located in the `.env.development` file.
To modify them, copy this file to `.env.development.local` and change to suit your needs. We recommend setting the
proper merchant id and an indicator whether you want to use the provided mock API.

## Mock API

Since initializing a session and submitting a payment is not part of the client SDK, but is necessary part of the
payment process, we included a demo mock API that can handle these tasks.
Please refer to the [mock API README](../../mock-api/README.md) file for more details.

## How to start the application

Run the following command to start a webserver on `localhost` at port `6503`.

```bash
yarn start
```

When the webserver has started, it will automatically load a page in which you have to provide details about
the Online Payments client session. You can use the provided mock API to conveniently fetch the session details.
