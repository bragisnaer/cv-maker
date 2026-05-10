import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Application } from '../types/application';
import type { CVData, ProfileMap } from '../types/cv';
import { DEFAULT_PROFILE_NAME } from '../lib/constants';
import { deepMerge, setPath } from '../lib/helpers';
import { SEED_CV } from '../lib/seed';
import {
  ensureProfiles,
  loadActiveProfile,
  loadApplications,
  saveActiveProfile,
  saveApplications,
  saveProfiles,
} from '../lib/storage';

/* ─────────────────────────────────────────────────────────────────
   State shape + actions
   ───────────────────────────────────────────────────────────── */

interface State {
  profiles: ProfileMap;
  active: string;
  applications: Application[];
}

type Action =
  | { type: 'set_cv'; profile: string; cv: CVData }
  | { type: 'set_path'; profile: string; path: (string | number)[]; value: unknown }
  | { type: 'set_active'; name: string }
  | { type: 'create_profile'; name: string; cv: CVData }
  | { type: 'rename_profile'; from: string; to: string }
  | { type: 'delete_profile'; name: string }
  | { type: 'reset_profile'; name: string }
  | { type: 'replace_profiles'; profiles: ProfileMap; active: string }
  | { type: 'set_applications'; list: Application[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_cv':
      return {
        ...state,
        profiles: { ...state.profiles, [action.profile]: { cv: action.cv } },
      };
    case 'set_path': {
      const current = state.profiles[action.profile];
      if (!current) return state;
      const next = setPath(current.cv, action.path, action.value);
      return {
        ...state,
        profiles: { ...state.profiles, [action.profile]: { cv: next } },
      };
    }
    case 'set_active':
      return { ...state, active: action.name };
    case 'create_profile':
      return {
        ...state,
        profiles: { ...state.profiles, [action.name]: { cv: action.cv } },
        active: action.name,
      };
    case 'rename_profile': {
      if (action.from === action.to || !state.profiles[action.from]) return state;
      const next: ProfileMap = {};
      for (const [k, v] of Object.entries(state.profiles)) {
        next[k === action.from ? action.to : k] = v;
      }
      return {
        ...state,
        profiles: next,
        active: state.active === action.from ? action.to : state.active,
      };
    }
    case 'delete_profile': {
      if (Object.keys(state.profiles).length <= 1) return state;
      const next = { ...state.profiles };
      delete next[action.name];
      const newActive =
        state.active === action.name ? (Object.keys(next)[0] ?? DEFAULT_PROFILE_NAME) : state.active;
      return { ...state, profiles: next, active: newActive };
    }
    case 'reset_profile':
      return {
        ...state,
        profiles: { ...state.profiles, [action.name]: { cv: SEED_CV } },
      };
    case 'replace_profiles':
      return { ...state, profiles: action.profiles, active: action.active };
    case 'set_applications':
      return { ...state, applications: action.list };
    default:
      return state;
  }
}

/* ─────────────────────────────────────────────────────────────────
   Context
   ───────────────────────────────────────────────────────────── */

interface StoreValue extends State {
  /** Active CV (already merged with SEED_CV for any new fields). */
  cv: CVData;
  setCV: (cv: CVData) => void;
  updatePath: (path: (string | number)[], value: unknown) => void;
  setActive: (name: string) => void;
  createProfile: (name: string, cv?: CVData) => void;
  renameProfile: (from: string, to: string) => void;
  deleteProfile: (name: string) => void;
  resetProfile: (name?: string) => void;
  replaceProfiles: (profiles: ProfileMap, active: string) => void;
  setApplications: (list: Application[]) => void;
  profileNames: string[];
}

const StoreContext = createContext<StoreValue | null>(null);

function init(): State {
  const profiles = ensureProfiles();
  const active = loadActiveProfile(profiles);
  const applications = loadApplications();
  return { profiles, active, applications };
}

export function CVStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Persist on every mutation. Cheap (small JSON) and removes a whole
  // class of bugs around forgetting to save.
  useEffect(() => {
    saveProfiles(state.profiles);
  }, [state.profiles]);
  useEffect(() => {
    saveActiveProfile(state.active);
  }, [state.active]);
  useEffect(() => {
    saveApplications(state.applications);
  }, [state.applications]);

  const cv = useMemo<CVData>(() => {
    const fromStore = state.profiles[state.active]?.cv;
    return fromStore ? deepMerge(SEED_CV, fromStore) : SEED_CV;
  }, [state.profiles, state.active]);

  const setCV = useCallback(
    (next: CVData) => dispatch({ type: 'set_cv', profile: state.active, cv: next }),
    [state.active],
  );
  const updatePath = useCallback(
    (path: (string | number)[], value: unknown) =>
      dispatch({ type: 'set_path', profile: state.active, path, value }),
    [state.active],
  );
  const setActive = useCallback(
    (name: string) => dispatch({ type: 'set_active', name }),
    [],
  );
  const createProfile = useCallback(
    (name: string, src?: CVData) =>
      dispatch({ type: 'create_profile', name, cv: src ?? SEED_CV }),
    [],
  );
  const renameProfile = useCallback(
    (from: string, to: string) => dispatch({ type: 'rename_profile', from, to }),
    [],
  );
  const deleteProfile = useCallback(
    (name: string) => dispatch({ type: 'delete_profile', name }),
    [],
  );
  const resetProfile = useCallback(
    (name?: string) => dispatch({ type: 'reset_profile', name: name ?? state.active }),
    [state.active],
  );
  const replaceProfiles = useCallback(
    (profiles: ProfileMap, active: string) =>
      dispatch({ type: 'replace_profiles', profiles, active }),
    [],
  );
  const setApplications = useCallback(
    (list: Application[]) => dispatch({ type: 'set_applications', list }),
    [],
  );

  const profileNames = useMemo(() => Object.keys(state.profiles), [state.profiles]);

  const value: StoreValue = {
    ...state,
    cv,
    setCV,
    updatePath,
    setActive,
    createProfile,
    renameProfile,
    deleteProfile,
    resetProfile,
    replaceProfiles,
    setApplications,
    profileNames,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCVStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCVStore must be used within CVStoreProvider');
  return ctx;
}
