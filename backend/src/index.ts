// eslint-disable-next-line import/no-unresolved, no-unused-vars
import { Request, Response } from "express";

import sendgrid from "@sendgrid/mail";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { isProduction } from "./environment";

// Instantiate a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

// eslint-disable-next-line import/prefer-default-export
export async function helloWorld(req: Request, res: Response) {
  res.set(
    "Access-Control-Allow-Origin",
    isProduction() ? "https://www.gigamesh.io" : "http://localhost:1234"
  );

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    const sendgridApiKey = await (async () => {
      if (isProduction()) {
        const [accessResponse] = await secretManager.accessSecretVersion({
          name: "projects/gigamesh-279607/secrets/sendgrid/versions/latest",
        });

        return accessResponse.payload!.data!.toString();
      }

      return process.env.SENDGRID_API_KEY!;
    })();

    sendgrid.setApiKey(sendgridApiKey);

    await sendgrid.send({
      to: "boyerstephan@gmail.com",
      from: "automated@gigamesh.io",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    });

    const message = req.query.message || "No message was provided.";
    res.status(200).send(message);
  }
}
