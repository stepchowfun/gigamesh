// eslint-disable-next-line import/no-unresolved, no-unused-vars
import { Request, Response } from "express";

// eslint-disable-next-line import/prefer-default-export
export function helloWorld(req: Request, res: Response) {
  const message = req.query.message || req.body.message || "Hello World!";
  res.status(200).send(message);
}
