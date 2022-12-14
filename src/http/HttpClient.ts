import { API_ENDPOINT } from "../constants";
import { getLocalUser } from "../storage/settings";

const defaultHeaders = {
  "X-ExplainDev-client-origin-version": process.env.REACT_APP_VERSION,
  "X-ExplainDev-client-origin-name": "webapp",
};

function updateOptions(options: RequestInit | undefined) {
  if (!options) return {};

  const { headers, ...otherOptions } = options;

  const user = getLocalUser();

  return {
    ...otherOptions,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...(user && { Authorization: `Basic ${btoa(`${user.email}:${user.key}`)}` }),

      ...defaultHeaders,
      ...headers,
      ...(otherOptions.body ? { "Content-Type": "application/json" } : {}),
    },
  };
}
class HttpClient {
  constructor(private readonly baseUrl: string = API_ENDPOINT) {}

  public async get(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "get",
      ...updateOptions(options),
    });
    return response;
  }

  public async post(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "post",
      ...updateOptions(options),
    });
    return response;
  }
}

export default HttpClient;
