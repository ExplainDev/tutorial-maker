import { AuthError, RateLimitError } from "../exceptions";
import { getLocalSettings, getLocalUser } from "../storage/settings";
import HttpClient from "./HttpClient";

const DEFAULT_SETTING_EXPLANATION_LEVEL = "basic";
const DEFAULT_LOCALE = "en";

interface ExplainOptions {
  source: string;
  language: string;
  mode: "full" | "selection";
  selection?: string;
  followupQuestions?: boolean;
  visitorId?: string;
}
export async function explain({ source, language, mode, selection, followupQuestions = true, visitorId }: ExplainOptions) {
  try {
    const user = getLocalUser();

    const localSettings = getLocalSettings();
    let explanationLevel = localSettings ? localSettings.level : DEFAULT_SETTING_EXPLANATION_LEVEL;
    let locale = localSettings ? localSettings.locale : DEFAULT_LOCALE;

    const http = new HttpClient();
    const headers: HeadersInit = {
      ...(user && { Authorization: `Basic ${btoa(`${user.email}:${user.key}`)}` }),
      "X-ExplainDev-client-origin-visitor-id": visitorId ? visitorId : "",
      "Content-Type": "application/json",
    };
    const res = await http.post(`/api/explain`, {
      headers,
      body: JSON.stringify({
        language,
        mode,
        source,
        explanationLevel,
        locale,
        followupQuestions,
        selection,
      }),
    });

    if (res.ok) {
      return await res.json();
    } else if (res.status === 401) {
      throw new AuthError("Authenticate");
    } else if (res.status === 429) {
      throw new RateLimitError("Rate limit exceeded. Please log in to get more explanations");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
