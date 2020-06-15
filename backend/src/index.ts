// eslint-disable-next-line import/no-unresolved, no-unused-vars
import { Request, Response } from "express";

// eslint-disable-next-line import/prefer-default-export
export function helloWorld(req: Request, res: Response) {
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
    const message = req.query.message || "No message was provided.";
    res.status(200).send(message);
  }
}
