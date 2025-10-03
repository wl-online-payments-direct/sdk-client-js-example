# Online Payments Client SDK Examples

This repository contains example apps for the Online Payments JavaScript Client SDK.
Refer to the README in each `examples/*` folder for more details about that specific example.

Before running the examples, make sure you run `yarn install` in the root folder of the repository.

The repository has shared code used by the examples. It is located in the `shared` folder.

Note that the examples are using the SDK as a peer dependency. It is currently installed in the root folder of the
repository. You need to add it to your `package.json` file as a dependency if you want to use it in your own project.

# Mock API

This library has an implementation of the server API via the OnlinePayments Node.js Server SDK. This helps in
initializing the session and submitting the payment requests, without a need for a separate backend application. It also
is useful for testing the tokenization feature of the SDK.
If you want to use it, check out the README file in the `mock-api` folder.
