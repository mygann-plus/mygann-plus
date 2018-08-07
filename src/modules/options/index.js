import classNames from 'classnames';

import createModule from '~/utils/module';
import storage from '~/utils/storage';
import {
  createElement,
  waitForLoad,
  insertCss,
} from '~/utils/dom';

import { MODULE_MAP, SECTION_MAP } from '~/module-map';
import Dialog from '~/utils/dialog';

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
    input: style.locals['module-input'],
    caption: style.locals['module-caption'],
    description: style.locals['module-description'],
    expandLink: style.locals['module-expand-link'],
    chevron: style.locals['module-chevron'],
    extraOptions: style.locals['module-extra-options'],
    expanded: style.locals['module-expanded'],
  },
  suboption: {
    input: style.locals['suboption-input'],
    label: style.locals['suboption-label'],
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
        sectionName,
        MODULE_MAP[sectionName],
      );
      if (section) {
        sectionWrap.appendChild(section);
      }
    }
    return sectionWrap;
  }

  createSectionView(publicName, hash, modules) {
    const moduleViews = modules.map(module => this.createModuleView(hash, module));
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

  createModuleView(sectionHash, module) {
    const moduleState = this.state[sectionHash][module.name];

    if (!module.config.showInOptions) return null;

    const moduleView = (
      <div className={selectors.module.wrap}>
        <div className={selectors.module.top}>
          <label
            className={ classNames('bb-check-wrapper', selectors.module.label) }
            htmlFor={module.name}
          >
            <input
              type="checkbox"
              checked={moduleState.enabled}
              className={selectors.module.input}
              name={module.name}
              onChange={ ({ target }) => { moduleState.enabled = target.checked; } }
            />
            <span className="bb-check-checkbox"></span>
            <span className={selectors.module.caption}>
              {formatModuleName(module.name)}
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

    if (Object.keys(module.config.options).length) {
      const extraOptions = (
        <div className={selectors.module.extraOptions}>
          {
            Object.keys(module.config.options).map(suboptName => (
              this.createSuboptionView(sectionHash, module, suboptName)
            ))
          }
        </div>
      );

      const onExpandLinkClick = e => {
        e.preventDefault();
        extraOptions.classList.toggle(selectors.module.expanded);
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

  createSuboptionView(sectionHash, module, key) {
    const suboption = module.config.options[key];
    const value = this.state[sectionHash][module.name].options[key];
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
            {suboption.enumValues.map(val => <option value={val}>{val}</option>)}
          </select>
        );
        break;
      default:
        break;
    }

    input.className = selectors.suboption.input;
    input.value = value;

    let oldValue = value;
    input.addEventListener('change', () => {
      if (validateSuboption(input, suboption)) {
        this.state[sectionHash][module.name].options[key] = input.value;
      } else {
        input.value = oldValue;
      }
    });

    const label = (
      <label className={selectors.suboption.label}>
        {suboption.name}:
        { input }
      </label>
    );

    return label;
  }

}

function getOptions() {
  return storage.get('options');
}
function saveOptions(optionState) {
  return storage.set({ options: optionState });
}
function getDefaultOptions() {
  const opts = {};

  for (const section in MODULE_MAP) {
    opts[section] = {};
    for (const module in MODULE_MAP[section]) {
      const { name: moduleName } = MODULE_MAP[section][module];

      opts[section][moduleName] = {
        enabled: MODULE_MAP[section][module].config.defaultEnabled,
        options: {},
      };

      for (const subopt in MODULE_MAP[section][module].config.options) {
        const { defaultValue } = MODULE_MAP[section][module].config.options[subopt];
        opts[section][moduleName].options[subopt] = defaultValue;
      }
    }
  }

  return opts;
}


async function showDialog() {
  const optionsData = await getOptions();
  const optionsDialog = new OptionsDialog(optionsData, saveOptions, getDefaultOptions);
  optionsDialog.open();
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
      <a href="#" className="pri-75-bgc-hover black-fgc white-fgc-hover active" onClick={showDialogDesktop}>
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

function options() {
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
  init: options,
  showInOptions: false,
});
