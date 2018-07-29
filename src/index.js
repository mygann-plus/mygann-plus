import storage from './utils/storage';
import { MODULE_MAP } from './module-map';

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
            moduleFunc.fn(optsData[section][module].options);
          }
        }
      }
    }
  }
}

async function initializeOptions() {
  const optsObj = await storage.get('options') || {};
  for (const section in MODULE_MAP) {
    if ({}.hasOwnProperty.call(MODULE_MAP, section)) {
      if (!optsObj[section]) {
        optsObj[section] = {};
      }
      for (const module in MODULE_MAP[section]) {
        if ({}.hasOwnProperty.call(MODULE_MAP[section], module)) {
          const { name: moduleName } = MODULE_MAP[section][module];

          if (optsObj[section][moduleName] === undefined) {
            optsObj[section][moduleName] = {
              enabled: true,
              options: {},
            };
          } else if (optsObj[section][moduleName].options === undefined) {
            optsObj[section][moduleName].options = {};
          }

          for (const subopt in MODULE_MAP[section][module].config.options) {
            if ({}.hasOwnProperty.call(MODULE_MAP[section][module].config.options, subopt)) {
              // option doesn't exist
              if (!optsObj[section][moduleName].options[subopt]) {
                const { defaultValue } = MODULE_MAP[section][module].config.options[subopt];
                optsObj[section][moduleName].options[subopt] = defaultValue;
              }
            }
          }

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
  loadModules();
  window.onhashchange = loadModules;
}

runExtension();
