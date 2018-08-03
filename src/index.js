import storage from '~/utils/storage';
import { MODULE_MAP } from '~/module-map';

import setCssVars from '~/utils/css-vars';

async function loadModules() {
  const optsData = await storage.get('options');
  for (const section in optsData) {
    if (window.location.hash.startsWith(section)) {
      for (const module in optsData[section]) {
        if (optsData[section][module].enabled) {
          const moduleFunc = (
            MODULE_MAP[section] &&
            MODULE_MAP[section].find(s => s.name === module)
          );
          if (moduleFunc) {
            // invoke module function with options data
            try {
              moduleFunc.fn(optsData[section][module].options);
            } catch (e) {
              if (process.env.NODE_ENV !== 'production') {
                console.error(e); // eslint-disable-line no-console
              }
            }
          }
        }
      }
    }
  }
}

async function initializeOptions() {
  const optsObj = await storage.get('options') || {};
  Object.setPrototypeOf(optsObj, null); // use as map

  for (const section in MODULE_MAP) {
    if (!optsObj[section]) {
      optsObj[section] = {};
    }
    for (const module in MODULE_MAP[section]) {
      const { name: moduleName } = MODULE_MAP[section][module];

      if (optsObj[section][moduleName] === undefined) {
        optsObj[section][moduleName] = {
          enabled: MODULE_MAP[section][module].config.defaultEnabled,
          options: {},
        };
      } else if (optsObj[section][moduleName].options === undefined) {
        optsObj[section][moduleName].options = {};
      }

      for (const subopt in MODULE_MAP[section][module].config.options) {
        // option doesn't exist
        if (!optsObj[section][moduleName].options[subopt]) {
          const { defaultValue } = MODULE_MAP[section][module].config.options[subopt];
          optsObj[section][moduleName].options[subopt] = defaultValue;
        }
      }
    }
  }
  await storage.set({ options: optsObj });
}

async function runExtension() {
  // TODO: only call initializeOptions on install and update
  // (plus dev feature to force initialization)
  await initializeOptions();
  setCssVars();
  loadModules();
  window.addEventListener('hashchange', loadModules);
}

runExtension();
