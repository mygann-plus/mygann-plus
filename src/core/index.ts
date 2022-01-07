import { diff as deepDiff } from 'deep-object-diff';

import { getRegisteredModules, Module } from '~/core/module';
import { modulesForHash } from '~/core/module-map';
import { fetchRemoteDisabled } from '~/core/remote-disable';
import {
  loadModule,
  softUnloadModule,
  hardUnloadModule,
  isModuleLoaded,
} from '~/core/module-loader';
import {
  AllOptions,
  getFlattenedOptions,
  setFlattenedOptions,
  mergeDefaultOptions,
  addOptionsChangeListener,
} from '~/core/options';

import setCssVars from '~/utils/css-vars';
import log from '~/utils/log';
import { isBookmarklet, markBookmarkletLoaded, isBookmarletLoaded } from '~/utils/bookmarklet';
import { ChangeListenerData } from '~/utils/storage';
import { checkForUpdates } from './install';

function getHash(url: string) {
  return new URL(url).hash || '#';
}

function loadModules(hash: string) {
  for (const module of modulesForHash(hash)) {
    loadModule(module);
  }
}

function unloadModules(oldHash: string, newHash: string) {
  const oldModules = modulesForHash(oldHash);
  const newModules = modulesForHash(newHash);

  const unloadedModules = new Set([...oldModules].filter(m => !newModules.has(m) && !m.config.stayLoaded));

  for (const module of unloadedModules) {
    if (!softUnloadModule(module)) { // module affects global state
      if (!hardUnloadModule(module)) {
        log('warn', `Failed to hard unload module '${module.config.name}'`);
      }
    }
  }
}

async function initializeOptions() {
  const optsObj = await getFlattenedOptions();
  await setFlattenedOptions(mergeDefaultOptions(optsObj));
}

function hardUnloadOrRefreshPage(module: Module) {
  if (!hardUnloadModule(module)) {
    return window.location.reload();
  }
}

async function applyNewOptions(optionsData: ChangeListenerData<AllOptions>) {
  const { oldValue: oldOptions, newValue: newOptions } = optionsData;
  const GUID_MAP = getRegisteredModules();
  const diff: AllOptions = deepDiff(oldOptions, newOptions) as any;

  for (const moduleGuid in diff) {
    const module = GUID_MAP[moduleGuid];
    if ('enabled' in diff[moduleGuid]) { // was the module enabled or disabled
      if (diff[moduleGuid].enabled) {
        if (modulesForHash(window.location.hash).has(module)) {
          loadModule(module);
        }
      } else {
        hardUnloadOrRefreshPage(module);
      }
    } else if (isModuleLoaded(module)) {
      hardUnloadOrRefreshPage(module);
      loadModule(module);
    }
  }
}

export default async function runExtension() {
  if (isBookmarklet()) {
    if (isBookmarletLoaded()) {
      return;
    }
    markBookmarkletLoaded();
  }

  await initializeOptions();
  checkForUpdates();
  fetchRemoteDisabled();
  setCssVars();
  addOptionsChangeListener(applyNewOptions);
  loadModules(getHash(window.location.href));

  window.addEventListener('hashchange', (e: HashChangeEvent) => {
    fetchRemoteDisabled();
    const newHash = getHash(e.newURL);
    const oldHash = getHash(e.oldURL);
    unloadModules(oldHash, newHash);
    loadModules(newHash);
  });
}
