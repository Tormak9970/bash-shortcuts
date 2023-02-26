import { sleep } from 'decky-frontend-lib';

/**
 * Waits for a condition to be true.
 * @param retries The number of times to retry the condition.
 * @param delay The time (in ms) between retries.
 * @param check The condition to check.
 * @returns A promise resolving to true if the check was true on any attempt, or false if it failed each time.
 */
export async function waitForCondition(retries: number, delay: number, check: () => (boolean | Promise<boolean>)): Promise<boolean> {
  const waitImpl = async (): Promise<boolean> => {
    try {
      let tries = retries + 1;
      while (tries-- !== 0) {
        if (await check()) {
          return true;
        }

        if (tries > 0) {
          await sleep(delay);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  };

  return await waitImpl();
}