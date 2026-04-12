/**
 * Shared Logic: LocalStorage Management System
 * Modules can import this store to save and retrieve their specific data.
 */

const APP_PREFIX = 'pribadiQue_';

export const store = {
  /**
   * Retrieves data from LocalStorage.
   * @param {string} module - The name/key of the module.
   * @param {any} defaultValue - The default value if no data exists.
   * @returns {any}
   */
  get(module, defaultValue = null) {
    try {
      const data = localStorage.getItem(`${APP_PREFIX}${module}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Store GET Error (${module}):`, error);
      return defaultValue;
    }
  },

  /**
   * Saves data to LocalStorage.
   * @param {string} module - The name/key of the module.
   * @param {any} data - The data to save.
   */
  set(module, data) {
    try {
      localStorage.setItem(`${APP_PREFIX}${module}`, JSON.stringify(data));
      // Dispatch a custom event so other parts of the app can react if needed
      window.dispatchEvent(new CustomEvent('storeUpdated', { detail: { module, data } }));
    } catch (error) {
      console.error(`Store SET Error (${module}):`, error);
    }
  },

  /**
   * Deletes a record from LocalStorage.
   * @param {string} module - The name/key of the module.
   */
  remove(module) {
    try {
      localStorage.removeItem(`${APP_PREFIX}${module}`);
    } catch (error) {
      console.error(`Store REMOVE Error (${module}):`, error);
    }
  }
};
