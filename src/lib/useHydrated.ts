"use client";

import { useSyncExternalStore } from "react";

/** Stable no-op subscription — the answer never changes after hydration. */
const subscribe = () => () => {};

/**
 * `false` on the server and during hydration, `true` afterwards.
 *
 * Used where a value genuinely cannot be known until the client takes over
 * (a media query, `document.body` for a portal). Reading those during render
 * produces markup that disagrees with the server; `useSyncExternalStore` gives
 * React an explicit server snapshot instead, so hydration matches and the
 * client-only value lands on the next commit.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
