import classNames from 'classnames';
import cloneDeep from 'lodash.clonedeep';
import { diff as deepDiff } from 'deep-object-diff';

import createModule from '~/utils/module';
import {
  createElement,
  waitForLoad,
  insertCss,
} from '~/utils/dom';
import Dialog from '~/utils/dialog';

import { MODULE_MAP, SECTION_MAP, GUID_MAP, modulesForHash } from '~/module-map';
import { hardUnloadModule, isModuleLoaded, loadModule } from '~/module-loader';
import { getFlattenedOptions, setFlattenedOptions, mergeDefaultOptions } from '~/options';

import style from './style.css';

const selectors = {
  section: {
    wrap: style.locals['section-wrap'],
    optionsWrap: style.locals['section-options-wrap'],
  },
  module: {
    wrap: style.locals['module-wrap'],
    top: style.locals['module-top'],
    label: style.locals['module-label'],
    caption: style.locals['module-caption'],
    description: style.locals['module-description'],
    expandLink: style.locals['module-expand-link'],
    chevron: style.locals['module-chevron'],
    extraOptions: style.locals['module-extra-options'],
    expanded: style.locals['module-expanded'],
  },
  toggle: {
    wrap: style.locals['toggle-wrap'],
    track: style.locals['toggle-track'],
    pill: style.locals['toggle-pill'],
  },
  suboption: {
    input: style.locals['suboption-input'],
    label: style.locals['suboption-label'],
    name: style.locals['suboption-name'],
  },
};

const formatModuleName = name => {
  let n = name.split(/(?=[A-Z])/).join(' ');
  return n.charAt(0).toUpperCase() + n.substring(1);
};
const formatDescription = desc => desc.replace(/\n/g, ' ');


function validateSuboption(input, suboption) {
  switch (suboption.type) {
    case 'number':
      const numValue = Number(input.value);
      if ('min' in suboption && numValue < suboption.min) return false;
      if ('max' in suboption && numValue > suboption.max) return false;
      if (suboption.validator && !suboption.validator(numValue)) return false;
      break;
    default:
      if (suboption.validator && !suboption.validator(input.value)) return false;
  }
  return true;
}

function getSuboptionValue(suboptElem, suboption) {
  switch (suboption.type) {
    case 'boolean':
      return suboptElem.querySelector('input').checked;
    default:
      return suboptElem.value;
  }
}
function setSuboptionValue(suboptElem, suboption, value) {
  switch (suboption.type) {
    case 'boolean':
      suboptElem.querySelector('input').checked = value;
      break;
    default:
      suboptElem.value = value;
  }
}

class OptionsDialog {

  constructor(optionsData, onSave, getDefaultState) {
    this.state = optionsData;
    this.onSave = onSave;
    this.getDefaultState = getDefaultState;

    this.bodyElement = this.renderBody();

    this.dialog = new Dialog('Gann OnCampus+ Options', this.bodyElement, {
      leftButtons: [{
        name: 'Save',
        primary: true,
        onClick: () => this.save(),
      },
      Dialog.buttons.CANCEL,
      ],
      rightButtons: [{
        name: 'Reset Options',
        type: Dialog.buttonTypes.BUTTON,
        onClick: () => {
          this.reset();
          return false;
        },
      }],
    });
  }

  open() {
    this.dialog.open();
  }
  save() {
    this.onSave(this.state);
  }
  reset() {
    this.state = this.getDefaultState();
    const newBodyElement = this.renderBody();
    this.bodyElement.replaceWith(newBodyElement);
    this.bodyElement = newBodyElement;
  }

  renderBody() {
    const sectionWrap = <div />;
    for (const sectionName in MODULE_MAP) {
      const section = this.createSectionView(
        SECTION_MAP[sectionName],
        MODULE_MAP[sectionName],
      );
      if (section) {
        sectionWrap.appendChild(section);
      }
    }
    return sectionWrap;
  }

  createSectionView(publicName, modules) {
    const moduleViews = modules.map(module => this.createModuleView(module));
    if (moduleViews.every(x => !x)) {
      // all modules are null, therefore hidden in options
      return null;
    }

    const sectionView = (
      <div className={selectors.section.wrap}>
        <div className="bb-section-heading">{publicName}</div>
        <div className={selectors.section.optionsWrap}></div>
      </div>
    );

    const optionsWrap = sectionView.querySelector(`.${selectors.section.optionsWrap}`);
    for (const moduleView of moduleViews) {
      if (moduleView) {
        optionsWrap.appendChild(moduleView);
      }
    }
    return sectionView;
  }

  createModuleView(module) {
    const moduleState = this.state[module.guid];

    if (!module.config.showInOptions) return null;

    const moduleView = (
      <div className={selectors.module.wrap}>
        <div className={selectors.module.top}>
          <label
            className={ classNames(selectors.toggle.wrap, selectors.module.label) }
          >
            <input
              type="checkbox"
              checked={moduleState.enabled}
              onChange={ ({ target }) => { moduleState.enabled = target.checked; } }
            />
            <span className={selectors.toggle.track}>
              <span className={selectors.toggle.pill} />
            </span>
            <span className={selectors.module.caption}>
              {formatModuleName(module.config.name)}
              {
                module.config.description &&
                <span className={selectors.module.description}>
                  - {formatDescription(module.config.description)}
                </span>
              }
            </span>
          </label>
        </div>
      </div>
    );

    if (Object.keys(module.config.suboptions).length) {
      const extraOptions = (
        <div className={selectors.module.extraOptions}>
          {
            Object.keys(module.config.suboptions).map(suboptName => (
              this.createSuboptionView(module, suboptName)
            ))
          }
        </div>
      );

      const onExpandLinkClick = e => {
        e.preventDefault();
        moduleView.classList.toggle(selectors.module.expanded);
      };

      const expandLink = (
        <a href="#" className={selectors.module.expandLink} onClick={ onExpandLinkClick }>
          <i className={classNames('fa fa-chevron-down', selectors.module.chevron)}></i>
        </a>
      );

      moduleView.appendChild(extraOptions);
      moduleView.querySelector(`.${selectors.module.top}`).appendChild(expandLink);
    }

    return moduleView;
  }

  createSuboptionView(module, key) {
    const suboption = module.config.suboptions[key];
    const value = this.state[module.guid].suboptions[key];
    let input;

    switch (suboption.type) {
      case 'string':
        input = <input />;
        break;
      case 'number':
        input = <input type="number" min={suboption.min} max={suboption.max} />;
        break;
      case 'enum':
        input = (
          <select>
            {Object.keys(suboption.enumValues).map(enumKey => (
              <option value={enumKey}>{suboption.enumValues[enumKey]}</option>
            ))}
          </select>
        );
        break;
      case 'boolean':
        input = (
          <label className="bb-check-wrapper">
            <input type="checkbox" />
            <span className="bb-check-checkbox"></span>
          </label>
        );
        break;
      default:
        break;
    }

    input.classList.add(selectors.suboption.input);
    setSuboptionValue(input, suboption, value);

    let oldValue = value;
    input.addEventListener('change', () => {
      if (validateSuboption(input, suboption)) {
        this.state[module.guid].suboptions[key] = getSuboptionValue(input, suboption);
      } else {
        setSuboptionValue(input, suboption, oldValue);
      }
    });

    const nameWrap = <span className={selectors.suboption.name}>{ suboption.name }</span>;
    const label = (
      <label className={selectors.suboption.label}>
        {
          suboption.type === 'boolean' ?
          [input, nameWrap] :
          [nameWrap, input]
        }
      </label>
    );

    return label;
  }

}

function hardUnloadOrRefreshPage(module) {
  if (!hardUnloadModule(module)) {
    return window.location.reload();
  }
}

async function saveOptions(oldOptions, newOptions) {
  await setFlattenedOptions(newOptions);
  const diff = deepDiff(oldOptions, newOptions);

  for (const moduleGuid in diff) {
    const module = GUID_MAP[moduleGuid];
    if ('enabled' in diff[moduleGuid]) {
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

function getDefaultOptions() {
  return mergeDefaultOptions({});
}

async function showDialog() {
  const optionsData = await getFlattenedOptions();
  const originalOptionsData = cloneDeep(optionsData);
  const dialog = new OptionsDialog(optionsData, newOptionsData => {
    saveOptions(originalOptionsData, newOptionsData);
  }, getDefaultOptions);
  dialog.open();
}

function appendDesktopNavLink() {
  const menu = document.querySelector('.oneline.parentitem.last > :nth-child(3) > :first-child');
  const nativeSettingsLink = menu.children[2];

  const showDialogDesktop = e => {
    e.preventDefault();
    showDialog();
  };

  const link = (
    <li>
      <a href="#" className="pri-75-bgc-hover black-fgc white-fgc-hover sky-nav" onClick={showDialogDesktop}>
        <span className="desc">
          <span className="title">OnCampus+ Options</span>
        </span>
      </a>
    </li>
  );

  nativeSettingsLink.after(link);

}

function appendMobileNavLink() {
  const showDialogMobile = e => {
    e.preventDefault();
    document.body.click(); // hide mobile nav
    showDialog();
  };

  const mobileNavLink = (
    <li>
      <a href="#" onClick={ showDialogMobile }>OnCampus+ Options</a>
    </li>
  );

  const nativeSettingsLink = document.getElementById('mobile-settings-link');
  nativeSettingsLink.after(mobileNavLink);
}

const domQuery = {
  header: () => document.querySelector('.oneline.parentitem.last .subnavtop'),
  mobileMenu: () => document.querySelector('#mobile-account-nav'),
};

function optionsDialog() {
  waitForLoad(domQuery.header).then(appendDesktopNavLink);

  waitForLoad(domQuery.mobileMenu).then(() => {
    document.querySelector('#mobile-account-nav').addEventListener('click', async () => {
      await waitForLoad(() => (
        document.querySelector('.app-mobile-level') &&
        document.querySelector('#mobile-settings-link')
      ));
      appendMobileNavLink();
    });
  });

  insertCss(style.toString());
}

export default createModule('{6f84183e-607b-4c90-9161-3451b002b541}', {
  name: 'Options',
  init: optionsDialog,
  showInOptions: false,
});
