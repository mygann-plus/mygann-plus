import semver from 'semver';

import { Module } from '~/core/module'; // eslint-disable-line import/no-cycle

import storage from '~/utils/storage';
import { fetchRawData } from '~/utils/fetch';
import getManifest from '~/utils/manifest';

interface DisabledModule {
  guid: string;
  extensionVersion: string; // semver version string
  message: string; // message to display to user
}

// storage data
const REMOTE_DISABLE_STORAGE_SCHEMA_VERSION = 1;
const REMOTE_DISABLE_STORAGE_KEY = 'remote_disable';

// server data
const REMOTE_DISABLE_PATH = '/remote-disable/remote-disable.json'; // eslint-disable-line max-len

export async function fetchRemoteDisabled() {
  const data = await fetchRawData(REMOTE_DISABLE_PATH);
  const { disabled } = data;
  storage.set(REMOTE_DISABLE_STORAGE_KEY, disabled, REMOTE_DISABLE_STORAGE_SCHEMA_VERSION);
}

export async function getRemoteDisabledStatus(module: Module) {
  const extensionVersion = getManifest().version_name;
  const storedDisabled: DisabledModule[] = await storage.get(
    REMOTE_DISABLE_STORAGE_KEY,
    REMOTE_DISABLE_STORAGE_SCHEMA_VERSION,
  );
  if (!storedDisabled) {
    return { disabled: false };
  }

  const disabledModule = storedDisabled.find(m => m.guid === module.guid);
  const isDisabled = disabledModule
    && semver.satisfies(extensionVersion, disabledModule.extensionVersion);

  if (isDisabled) {
    return {
      disabled: true,
      message: disabledModule.message,
    };
  }

  return { disabled: false };
}
