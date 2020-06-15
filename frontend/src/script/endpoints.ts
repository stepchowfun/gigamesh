// eslint-disable-next-line no-unused-vars
import axios, { AxiosResponse } from "axios";

// eslint-disable-next-line import/prefer-default-export
export function helloWorld(message: string): Promise<AxiosResponse<string>> {
  return axios.get(
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/"
      : "https://us-east1-gigamesh-279607.cloudfunctions.net/helloWorld",
    {
      params: { message },
    }
  );
}
