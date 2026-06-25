export const BIRTHDAY_PROGRESS_EVENT = "tara30:progress-changed";

export function dispatchBirthdayProgressEvent() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(BIRTHDAY_PROGRESS_EVENT));
}
