import storage from './utils/storage';
import { MODULE_MAP } from './module-map';
import options from './options';

async function loadModules() {
  let optsData = await storage.get('options');

  if (window.location.hash.startsWith('#account')) {
    return options();
  }

  for (let section in optsData) {
    if (window.location.hash.startsWith(`#${section}`)) {
      for (let module in optsData[section]) {
        if (optsData[section][module]) MODULE_MAP[section].filter(s => s.name === module)[0]();
      }
    }
  }

}

window.onhashchange = loadModules;

loadModules();
