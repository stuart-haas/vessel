import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { config as fetchConfig } from './client';

const STORAGE_KEY = 'vessel.selectedBibleId';
const FALLBACK_BIBLE_ID = 'de4e12af7f2817c0-01';

type SettingsContextValue = {
  bibleId: string;
  setBibleId: (id: string) => void;
  ready: boolean;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [bibleId, setBibleIdState] = useState(FALLBACK_BIBLE_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setBibleIdState(stored);
        } else {
          // First launch: seed from the server's default.
          const res = await fetchConfig().catch(() => null);
          if (res?.data?.default_bible_id) setBibleIdState(res.data.default_bible_id);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setBibleId = (id: string) => {
    setBibleIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ bibleId, setBibleId, ready }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
