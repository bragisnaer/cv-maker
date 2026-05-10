import type { Application } from '../types/application';
import type { CVData, ProfileMap } from '../types/cv';
import { DEFAULT_PROFILE_NAME } from './constants';
import { SEED_APPLICATIONS, SEED_CV } from './seed';

/**
 * Persistence layer. Single source of truth for every read/write of
 * CV data, profiles, and applications. Components should never call
 * localStorage or indexedDB directly — go through these helpers so
 * the format stays versionable and the storage backend remains
 * swappable (e.g. for an optional sync mode later).
 */

// Keys are stable across versions. Renames here are migrations.
const PROFILES_KEY = 'cv-profiles';
const ACTIVE_KEY = 'cv-active';
const APPS_KEY = 'cv-applications';
const LEGACY_CV_KEY = 'cv-data';

const IDB_NAME = 'cv-maker';
const IDB_STORE = 'images';

/* ─── Profiles ───────────────────────────────────────────────────── */

export function loadProfiles(): ProfileMap | null {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) {
      return parsed as ProfileMap;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProfiles(profiles: ProfileMap): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // quota or serialization error; silent — UI surfaces failures
  }
}

export function loadActiveProfile(profiles: ProfileMap): string {
  const stored = localStorage.getItem(ACTIVE_KEY);
  if (stored && profiles[stored]) return stored;
  return Object.keys(profiles)[0] ?? DEFAULT_PROFILE_NAME;
}

export function saveActiveProfile(name: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, name);
  } catch {
    // ignore
  }
}

/**
 * Initialise profiles on first run, migrating the v1 `cv-data` key
 * if present. Returns the resolved profile map.
 */
export function ensureProfiles(): ProfileMap {
  const existing = loadProfiles();
  if (existing) return existing;

  let cv: CVData = SEED_CV;
  try {
    const legacy = localStorage.getItem(LEGACY_CV_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<CVData>;
      cv = { ...SEED_CV, ...parsed };
    }
  } catch {
    // legacy unreadable — keep seed
  }

  const profiles: ProfileMap = { [DEFAULT_PROFILE_NAME]: { cv } };
  saveProfiles(profiles);
  try {
    localStorage.removeItem(LEGACY_CV_KEY);
  } catch {
    // ignore
  }
  return profiles;
}

/* ─── Applications ───────────────────────────────────────────────── */

export function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return SEED_APPLICATIONS.slice();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as Application[];
    return SEED_APPLICATIONS.slice();
  } catch {
    return SEED_APPLICATIONS.slice();
  }
}

export function saveApplications(list: Application[]): void {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(list));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('saveApplications failed', err);
  }
}

/* ─── IndexedDB image store ──────────────────────────────────────── */

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function imageGet(key: string): Promise<string | null> {
  try {
    const db = await idbOpen();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => {
        const value = req.result;
        resolve(typeof value === 'string' ? value : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function imagePut(key: string, value: string): Promise<void> {
  try {
    const db = await idbOpen();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

export async function imageDelete(key: string): Promise<void> {
  try {
    const db = await idbOpen();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

/* ─── Key helpers (stable, used to namespace IDB entries) ───────── */

export const profileHeadshotKey = (profileName: string): string =>
  `headshot:${profileName}`;

export const applicationHeadshotKey = (applicationId: string): string =>
  `app-headshot:${applicationId}`;
