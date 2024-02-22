import { useEffect, useState } from "react";
import { PyInterop } from "../../../../PyInterop";

/**
 * Returns a React state for a plugin's setting.
 * @param key The key of the setting to use.
 * @param def The default value of the setting.
 * @returns A React state for the setting.
 */
export function useSetting<T>(
  key: string,
  def: T,
): [value: T, setValue: (value: T) => Promise<void>] {
  const [value, setValue] = useState(def);

  useEffect(() => {
    (async () => {
      const res = await PyInterop.getSetting<T>(key, def);
      setValue(res);
    })();
  }, []);

  return [
    value,
    async (val: T) => {
      setValue(val);
      await PyInterop.setSetting(key, val);
    },
  ];
}
