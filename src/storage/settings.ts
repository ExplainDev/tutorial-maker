export function setLocalUser(user: User) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getLocalUser(): User | null {
  const user = window.localStorage.getItem("user");

  if (!user) return null;

  return JSON.parse(user);
}

export function removeLocalUser() {
  window.localStorage.removeItem("user");
}

export function initSettings() {
  const defaultSettings = {
    locale: "en",
    level: "advanced",
  };
  window.localStorage.setItem("settings", JSON.stringify(defaultSettings));

  return defaultSettings;
}

export function getLocalSettings(): LocalSettings | null {
  const local = window.localStorage.getItem("settings");

  if (!local) return null;

  return JSON.parse(local) as LocalSettings;
}

export function setLocalSettings(newSettings: Partial<LocalSettings>) {
  const currentSettings = window.localStorage.getItem("settings");

  if (!currentSettings) return;

  window.localStorage.setItem("settings", JSON.stringify({ ...JSON.parse(currentSettings), ...newSettings }));
}
