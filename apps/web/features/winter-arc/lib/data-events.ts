/** Tell open Winter Arc screens that mock data changed (e.g. demo scenario switch). */
const EVENT = "b-core:winter-arc:data-changed";

export function notifyDataChanged(): void {
  window.dispatchEvent(new Event(EVENT));
}

export function onDataChanged(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
