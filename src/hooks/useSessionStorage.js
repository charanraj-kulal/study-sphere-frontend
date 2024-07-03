import { useState, useCallback, useEffect } from "react";

const IS_SERVER = typeof window === "undefined";

export function useSessionStorage(key, initialValue, options = {}) {
  const { initializeWithValue = true } = options;

  const serializer = useCallback(
    (value) =>
      options.serializer ? options.serializer(value) : JSON.stringify(value),
    [options]
  );

  const deserializer = useCallback(
    (value) => {
      if (options.deserializer) return options.deserializer(value);
      if (value === "undefined") return undefined;
      const defaultValue =
        initialValue instanceof Function ? initialValue() : initialValue;
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return defaultValue;
      }
    },
    [options, initialValue]
  );

  const readValue = useCallback(() => {
    const initialValueToUse =
      initialValue instanceof Function ? initialValue() : initialValue;
    if (IS_SERVER) return initialValueToUse;

    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? deserializer(raw) : initialValueToUse;
    } catch (error) {
      console.warn(`Error reading sessionStorage key “${key}”:`, error);
      return initialValueToUse;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState(() =>
    initializeWithValue ? readValue() : initialValue
  );

  const setValue = useCallback(
    (value) => {
      if (IS_SERVER) {
        console.warn(
          `Tried setting sessionStorage key “${key}” even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(readValue()) : value;
        window.sessionStorage.setItem(key, serializer(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new StorageEvent("session-storage", { key }));
      } catch (error) {
        console.warn(`Error setting sessionStorage key “${key}”:`, error);
      }
    },
    [key, serializer, readValue]
  );

  const removeValue = useCallback(() => {
    if (IS_SERVER) {
      console.warn(
        `Tried removing sessionStorage key “${key}” even though environment is not a client`
      );
      return;
    }

    const defaultValue =
      initialValue instanceof Function ? initialValue() : initialValue;
    window.sessionStorage.removeItem(key);
    setStoredValue(defaultValue);
    window.dispatchEvent(new StorageEvent("session-storage", { key }));
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [key, readValue]);

  const handleStorageChange = useCallback(
    (event) => {
      if (event.key && event.key !== key) return;
      setStoredValue(readValue());
    },
    [key, readValue]
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-storage", handleStorageChange);
    };
  }, [handleStorageChange]);

  return [storedValue, setValue, removeValue];
}
