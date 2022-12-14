export function hasSeenOnboarding(): boolean {
  const local = window.localStorage.getItem("hasSeenOnboarding");

  if (!local) return false;

  try {
    const hasSeen = JSON.parse(local);

    return Boolean(hasSeen);
  } catch (err) {
    return false;
  }
}

export function setHasSeenOnboarding(): void {
  window.localStorage.setItem("hasSeenOnboarding", "true");
}
