import { PyInterop } from "../PyInterop";
import { waitForCondition } from "./Utils";

/**
 * Waits until the services are initialized.
 * @returns A promise resolving to true if services were initialized on any attempt, or false if all attemps failed.
 */
export async function waitForServicesInitialized(): Promise<boolean> {
  type WindowEx = Window & { App?: { WaitForServicesInitialized?: () => Promise<boolean> } };
  const servicesFound = await waitForCondition(20, 250, () => (window as WindowEx).App?.WaitForServicesInitialized != null);

  if (servicesFound) {
    PyInterop.log(`Services found.`);
  } else {
    PyInterop.log(`Couldn't find services.`);
  }

  return (await (window as WindowEx).App?.WaitForServicesInitialized?.().then(() => {
    PyInterop.log(`Services initialized.`);
  })) ?? false;
}