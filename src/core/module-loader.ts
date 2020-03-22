/* eslint-disable import/no-cycle */

import { Module } from '~/core/module';
import { getOptionsFor } from '~/core/options';
import { getRemoteDisabledStatus } from '~/core/remote-disable';

/* eslint-enable import/no-cycle */

import log from '~/utils/log';

/**
module: {
  suboptions: {},
  unloaderContext: UnloaderContext
}
 */
const loadedModules = new Map();
const loadingModules = new Set();

async function tryRunFunctionAsync(fn: Function) {
  try {
    await fn();
    return true;
  } catch (e) {
    log('error', e);
    return false;
  }
}
function tryRunFunctionSync(fn: Function) {
  try {
    fn();
    return true;
  } catch (e) {
    log('error', e);
    return false;
  }
}

export interface Removable {
  remove: Function;
}

export class UnloaderContext {

  removables: Removable[] = [];

  /**
   * @param {*} removable Object which has a .remove method
   */
  addRemovable(removable: Removable) {
    this.removables.push(removable);
    return {
      remove: () => {
        this.removables.splice(this.removables.indexOf(removable), 1);
      },
    };
  }

  addFunction(fn: Function) {
    const removable = ({ remove: fn });
    return this.addRemovable(removable);
  }
}

function runUnloaderContext(context: UnloaderContext) {
  for (const removable of context.removables.reverse()) {
    removable.remove();
  }
}

export function isModuleLoaded(module: Module) {
  return loadedModules.has(module);
}

export async function loadModule(module: Module, waitUntilLoaded = false) {
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

export function softUnloadModule(module: Module) {
  if (!isModuleLoaded(module)) {
    return true;
  }
  if (!module.config.affectsGlobalState) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}

export function hardUnloadModule(module: Module) {
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
