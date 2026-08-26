"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_SITE_VERSION,
  readSiteConfigEnvelope,
  SITE_CONFIG_ENDPOINT,
  type SiteVersion,
} from "@/lib/siteVersion";

/**
 * Which portfolio build is mounted.
 *
 * The visitor no longer chooses this: the dashboard writes the active version
 * to the database and this store reads it back once per page load from an
 * opaque public endpoint. Keeping it in a module store rather than a hook means
 * one fetch and one source of truth no matter how many components subscribe.
 */
export type PortfolioVersion = SiteVersion;

type VersionState = {
  version: PortfolioVersion;
  /** False until the first lookup settles — success or failure — then true forever. */
  resolved: boolean;
};

/**
 * Before the server answers we report the default and `resolved: false`, which
 * lets the page hold its paint instead of showing v1 and flipping to v2.
 */
let state: VersionState = { version: DEFAULT_SITE_VERSION, resolved: false };

const listeners = new Set<() => void>();

/** One fetch per page load, however many components subscribe or when. */
let started = false;

/**
 * Stable identity, and always the pre-fetch state, so the hydration render
 * matches the server HTML exactly.
 */
const SERVER_STATE: VersionState = { version: DEFAULT_SITE_VERSION, resolved: false };

function publish(version: PortfolioVersion) {
  if (state.resolved && state.version === version) return;
  state = { version, resolved: true };
  listeners.forEach((listener) => listener());
}

async function resolveFromServer() {
  try {
    const response = await fetch(SITE_CONFIG_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`);
    publish(readSiteConfigEnvelope(await response.json()));
  } catch {
    // A failed lookup is never something the reader should see. The site simply
    // stays on the default build, and `resolved` still flips so the page paints.
    publish(DEFAULT_SITE_VERSION);
  }
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  void resolveFromServer();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): VersionState {
  return state;
}

function getServerSnapshot(): VersionState {
  return SERVER_STATE;
}

/** The active version. Reads as the default until the server answers. */
export function usePortfolioVersion(): PortfolioVersion {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).version;
}

/** The same fact, plus whether the first lookup has settled yet. */
export function useSiteVersionState(): VersionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
