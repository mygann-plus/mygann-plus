import storage from './utils/storage';
import { MODULE_MAP } from './module-map';

async function loadModules() {
  let optsData = await storage.get('options');
  for (let section in optsData) {
    if (window.location.hash.startsWith(section)) {
      for (let module in optsData[section]) {
        if (optsData[section][module].enabled) {
          const moduleFunc = MODULE_MAP[section].find(s => s.name === module);
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
  for (let i in MODULE_MAP) {
    if ({}.hasOwnProperty.call(MODULE_MAP, i)) {
      if (!optsObj[i]) {
        optsObj[i] = {};
      }
      for (let j in MODULE_MAP[i]) {
        if ({}.hasOwnProperty.call(MODULE_MAP[i], j)) {
          const { name: moduleName } = MODULE_MAP[i][j];

          if (optsObj[i][moduleName] === undefined) {
            optsObj[i][moduleName] = {
              enabled: true,
              options: {},
            };
          } else if (optsObj[i][moduleName].options === undefined) {
            optsObj[i][moduleName].options = {};
          }

          for (let subopt in MODULE_MAP[i][j].config.options) {
            if ({}.hasOwnProperty.call(MODULE_MAP[i][j].config.options, subopt)) {
              // option doesn't exist
              if (!optsObj[i][moduleName].options[subopt]) {
                const { defaultValue } = MODULE_MAP[i][j].config.options[subopt];
                optsObj[i][moduleName].options[subopt] = defaultValue;
              }
            }
          }

        }
      }
    }
  }
  await storage.set({ options: optsObj });
}

window.onhashchange = loadModules;

loadModules();

// TODO: only call initializeOptions on install and update
// (plus dev feature to force initialization)
initializeOptions();
