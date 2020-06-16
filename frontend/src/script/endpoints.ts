// eslint-disable-next-line no-unused-vars
import axios, { AxiosResponse } from "axios";

import { isProduction } from "./environment";

// eslint-disable-next-line import/prefer-default-export
export function helloWorld(message: string): Promise<AxiosResponse<string>> {
  return axios.get(
    isProduction()
      ? "https://us-east1-gigamesh-279607.cloudfunctions.net/helloWorld"
      : "http://localhost:8080/",
    {
      params: { message },
    }
  );
}
