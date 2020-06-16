// eslint-disable-next-line import/no-unresolved, no-unused-vars
import { Request, Response } from "express";

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import * as sendgrid from "@sendgrid/mail";

// Instantiate a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

// eslint-disable-next-line import/prefer-default-export
export async function helloWorld(req: Request, res: Response) {
  res.set(
    "Access-Control-Allow-Origin",
    process.env.NODE_ENV === "development"
      ? "http://localhost:1234"
      : "https://www.gigamesh.io"
  );

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    const [accessResponse] = await secretManager.accessSecretVersion({
      name: "projects/gigamesh-279607/secrets/sendgrid/versions/latest",
    });

    const sendgridApiKey = accessResponse.payload!.data!.toString();

    sendgrid.setApiKey(sendgridApiKey);

    const email = {
      to: "boyerstephan@gmail.com",
      from: "automated@gigamesh.io",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sendgrid.send(email);

    const message = req.query.message || "No message was provided.";
    res.status(200).send(message);
  }
}
