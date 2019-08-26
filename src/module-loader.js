import { getOptionsFor } from '~/options';
import { getRemoteDisabledStatus } from '~/remote-disable';
import log from '~/utils/log';

/**
module: {
  suboptions: {},
  unloaderContext: UnloaderContext
}
 */
const loadedModules = new Map();
const loadingModules = new Set();

async function tryRunFunctionAsync(fn) {
  try {
    await fn();
    return true;
  } catch (e) {
    log('error', e);
    return false;
  }
}
function tryRunFunctionSync(fn) {
  try {
    fn();
    return true;
  } catch (e) {
    log('error', e);
    return false;
  }
}

class UnloaderContext {
  constructor() {
    this.removables = [];
  }

  /**
   * @param {*} removable Object which has a .remove method
   */
  addRemovable(removable) {
    this.removables.push(removable);
    return {
      remove: () => {
        this.removables.splice(this.removables.indexOf(removable), 1);
      },
    };
  }

  addFunction(fn) {
    this.removables.push({
      remove: fn,
    });
    return {
      remove: () => {
        this.removables.splice(this.removables.indexOf(fn), 1);
      },
    };
  }
}

function runUnloaderContext(context) {
  for (const removable of context.removables.reverse()) {
    removable.remove();
  }
}

export function isModuleLoaded(module) {
  return loadedModules.has(module);
}

export async function loadModule(module, waitUntilLoaded = false) {
  if ((await getRemoteDisabledStatus(module)).disabled) {
    return;
  }


  const options = await getOptionsFor(module.guid);
  const unloaderContext = isModuleLoaded(module)
    ? loadedModules.get(module).unloaderContext
    : new UnloaderContext();

  if (!options.enabled) {
    return false;
  }
  // nested async function to prevent this from delaying other module loading
  const loadedPromise = (async () => {
    if (!loadingModules.has(module)) {
      loadingModules.add(module);
      if (!isModuleLoaded(module) && module.init) {
        if (!await tryRunFunctionAsync(() => module.init(options.suboptions, unloaderContext))) {
          // if init fails, run unloader context, and don't run main.
          loadingModules.delete(module);
          runUnloaderContext(unloaderContext);
          return;
        }
      }
      if (module.main) {
        await tryRunFunctionAsync(() => module.main(options.suboptions, unloaderContext));
      }
      loadedModules.set(module, {
        suboptions: options.suboptions,
        unloaderContext,
      });
      loadingModules.delete(module);
    }
  })();
  if (waitUntilLoaded) {
    await loadedPromise;
  }
  return true;
}

export function softUnloadModule(module) {
  if (!isModuleLoaded(module)) {
    return true;
  }
  if (!module.config.affectsGlobalState) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}

export function hardUnloadModule(module) {
  if (!isModuleLoaded(module)) {
    return true;
  }
  const { suboptions, unloaderContext } = loadedModules.get(module);
  if (!unloaderContext.removables.length && !module.unload) {
    return false;
  }
  const unloaded = tryRunFunctionSync(() => {
    if (module.unload) {
      module.unload(suboptions);
    }
    runUnloaderContext(unloaderContext);
  });
  if (unloaded) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}

export function getLoadedModules() {
  return loadedModules;
}
export function getLoadingModules() {
  return loadingModules;
}
