"use client";

// One cadence for the whole page: the route schedule and the subscribe form share it.
import { useSyncExternalStore } from "react";

let cadence = 2;
const listeners = new Set<() => void>();

export function setCadence(next: number) {
  if (next === cadence) return;
  cadence = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCadence() {
  return useSyncExternalStore(
    subscribe,
    () => cadence,
    () => 2,
  );
}
