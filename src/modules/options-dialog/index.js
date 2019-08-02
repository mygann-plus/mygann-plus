import classNames from 'classnames';
import registerModule from '~/module';
import {
  createElement,
  insertCss,
  constructButton,
} from '~/utils/dom';
import Dialog from '~/utils/dialog';
import fuzzyMatch from '~/utils/search';
import log from '~/utils/log';

import { appendDesktopUserMenuLink, appendMobileUserMenuLink } from '~/shared/user-menu';
import { MODULE_MAP, SECTION_MAP } from '~/module-map';
import { getFlattenedOptions, setFlattenedOptions, mergeDefaultOptions } from '~/options';
import { isRemoteDisabled } from '~/remote-disable';

import style from './style.css';

const selectors = {
  searchbarWrap: style.locals['searchbar-wrap'],
  searchbar: style.locals.searchbar,
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
    description: style.locals['suboption-description'],
    hidden: style.locals['suboption-hidden'],
    reset: style.locals['suboption-reset'],
    resetVisible: style.locals['suboption-reset-visible'],
  },
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

function createSuboptionInput(suboption) {
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
    case 'combo':
      const id = Math.floor(Math.random() * 1000);
      input = (
        <span>
          <input list={id} />
          <datalist id={id}>
            {
              suboption.presetValues.map(value => (
                <option value={value} />
              ))
            }
          </datalist>
        </span>
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
    case 'textarea':
      input = <textarea />;
      break;
    case 'email':
      input = <input type="email"></input>;
      break;
    case 'password':
      input = <input type="password"></input>;
      break;
    case 'color':
      input = <input type="color"></input>;
      break;
    default:
      log('warn', `Unknown suboption type ${suboption.type}`);
      break;
  }
  return input;
}

function getSuboptionValue(suboptElem, suboption) {
  switch (suboption.type) {
    case 'boolean':
      return suboptElem.querySelector('input').checked;
    case 'combo':
      return suboptElem.querySelector('input').value;
    default:
      return suboptElem.value;
  }
}
function setSuboptionValue(suboptElem, suboption, value) {
  switch (suboption.type) {
    case 'boolean':
      suboptElem.querySelector('input').checked = value;
      break;
    case 'combo':
      suboptElem.querySelector('input').value = value;
      break;
    default:
      suboptElem.value = value;
  }
}

function getTopLevelModules() {
  const topLevelModules = [];
  for (const sectionName in MODULE_MAP) {
    const modules = MODULE_MAP[sectionName].filter(module => module.config.topLevelOption);
    topLevelModules.push(...modules);
  }
  return topLevelModules;
}

class OptionsDialog {

  constructor(optionsData, onSave, getDefaultState) {
    this.state = optionsData;
    this.onSave = onSave;
    this.getDefaultState = getDefaultState;

    // [module.guid]: [suboptionKey1, suboptionKey2, ...]
    this.dependentSuboptions = {};
  }

  async constructDialog() {
    this.bodyElement = await this.renderBody();

    this.dialog = new Dialog('MyGann+ Options', this.bodyElement, {
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

    this.disableSaveButton();
  }

  open() {
    this.dialog.open();
  }
  save() {
    this.onSave(this.state);
  }
  async reset() {
    this.state = this.getDefaultState();
    const newBodyElement = await this.renderBody();
    this.bodyElement.replaceWith(newBodyElement);
    this.bodyElement = newBodyElement;
    this.enableSaveButton();
  }

  async renderBody() {
    this.moduleElems = [];
    const bodyWrap = <div />;
    const searchbar = this.createSearchBar();
    bodyWrap.appendChild(searchbar);
    const createdModules = []; // prevent modules listed for two hashes from appearng twice
    const topLevelModules = getTopLevelModules();
    for (const module of topLevelModules) {
      const moduleView = this.createTopLevelModuleView(module);
      if (moduleView) {
        bodyWrap.appendChild(moduleView);
      }
    }
    for (const sectionName in MODULE_MAP) {
      const section = await this.createSectionView(
        SECTION_MAP[sectionName],
        MODULE_MAP[sectionName],
        createdModules,
      );
      if (section) {
        bodyWrap.appendChild(section);
      }
    }
    return bodyWrap;
  }

  createSearchBar() {
    return (
      <form autoComplete="off" className={selectors.searchbarWrap}>
        <label htmlFor={selectors.searchbar}>
          <i className="fa fa-search"></i>
        </label>
        <input
          className={selectors.searchbar}
          id={selectors.searchbar}
          placeholder="Search..."
          autoComplete="off"
          onInput={ e => this.handleSearch(e) }
        />
      </form>
    );
  }

  async createSectionView(publicName, modules, createdModules) {
    const moduleViews = await Promise.all(modules.map(module => {
      if (!createdModules.includes(module)) {
        createdModules.push(module);
        return this.createModuleView(module);
      }
    }));
    if (moduleViews.every(x => !x)) {
      // all modules are null or already shown, therefore hidden in options
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

  async createModuleView(module) {
    const moduleState = this.state[module.guid];

    const shouldRender = module.config.showInOptions
      && !module.config.topLevelOption
      && !await isRemoteDisabled(module);
    if (!shouldRender) {
      return null;
    }

    const onToggleChange = ({ target }) => {
      moduleState.enabled = target.checked;
      this.enableSaveButton();
    };

    const moduleView = (
      <div className={selectors.module.wrap}>
        <div className={selectors.module.top}>
          <label
            className={ classNames(selectors.toggle.wrap, selectors.module.label) }
          >
            <input
              type="checkbox"
              checked={moduleState.enabled}
              onChange={onToggleChange}
            />
            <span className={selectors.toggle.track}>
              <span className={selectors.toggle.pill} />
            </span>
            <span className={selectors.module.caption}>
              {module.config.name}
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

    this.moduleElems.push({
      name: module.config.name,
      element: moduleView,
    });
    return moduleView;
  }

  createSuboptionView(module, key) {
    const suboption = module.config.suboptions[key];
    const value = this.state[module.guid].suboptions[key];
    let input = createSuboptionInput(suboption);

    input.classList.add(selectors.suboption.input);
    setSuboptionValue(input, suboption, value);

    let oldValue = value;
    input.addEventListener('change', () => {
      if (validateSuboption(input, suboption)) {

        const newValue = getSuboptionValue(input, suboption);
        this.state[module.guid].suboptions[key] = newValue;
        oldValue = newValue;
        this.enableSaveButton();

        if (suboption.type === 'boolean') {
          if (newValue) {
            this.enableDependentSuboptions(module, key);
          } else {
            this.disableDependentSuboptions(module, key);
          }
        }

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

    if (suboption.dependent) {
      const dependentEnabled = this.state[module.guid].suboptions[suboption.dependent];
      if (!dependentEnabled) {
        label.classList.add(selectors.suboption.hidden);
      }
      this.registerDependentSuboption(module, key, label);
    }

    return label;
  }

  createTopLevelModuleView(module) {
    if (!module.config.showInOptions) return null;

    const topLevelView = (
      <div className={selectors.section.wrap}>
        <div className="bb-section-heading">{module.config.name}</div>
        <div className={selectors.section.optionsWrap}></div>
      </div>
    );

    for (const key in module.config.suboptions) {
      const suboption = module.config.suboptions[key];

      const input = createSuboptionInput(suboption);
      const resetSuboptionButton = constructButton(
        'Reset', '', '',
        () => {}, selectors.suboption.reset,
      );

      const value = this.state[module.guid].suboptions[key];
      const description = suboption.description && formatDescription(suboption.description);
      setSuboptionValue(input, suboption, value);

      if (suboption.resettable && value !== suboption.defaultValue) {
        resetSuboptionButton.classList.add(selectors.suboption.resetVisible);
      }

      input.addEventListener('change', () => {
        if (validateSuboption(input, suboption)) {
          const newValue = getSuboptionValue(input, suboption);
          this.state[module.guid].suboptions[key] = newValue;
          this.enableSaveButton();
          if (suboption.resettable && newValue !== suboption.defaultValue) {
            resetSuboptionButton.classList.add(selectors.suboption.resetVisible);
          } else {
            resetSuboptionButton.classList.remove(selectors.suboption.resetVisible);
          }
        } else {
          setSuboptionValue(input, suboption, value);
        }
      });

      resetSuboptionButton.addEventListener('click', () => {
        setSuboptionValue(input, suboption, suboption.defaultValue);
        this.state[module.guid].suboptions[key] = suboption.defaultValue;
        this.enableSaveButton();
        resetSuboptionButton.classList.remove(selectors.suboption.resetVisible);
      });

      const suboptionView = (
        <div className={selectors.module.wrap}>
          <div className={selectors.module.top}>
            <span className={selectors.module.caption}>
              { suboption.name }
              {
                suboption.description ?
                  (
                    <span className={selectors.suboption.description}>
                      &nbsp;- {
                        suboption.htmlDescription ?
                        <span innerHTML={ description } /> :
                        description
                      }
                    </span>
                  ) :
                  null
              }
            </span>
            { input }
            { resetSuboptionButton }
          </div>
        </div>
      );

      topLevelView.querySelector(`.${selectors.section.optionsWrap}`).appendChild(suboptionView);
    }

    return topLevelView;
  }

  disableSaveButton() {
    this.dialog.getLeftButton(0).disabled = true;
  }
  enableSaveButton() {
    this.dialog.getLeftButton(0).disabled = false;
  }

  registerDependentSuboption(module, suboptionKey, element) {
    this.dependentSuboptions[module.guid] = this.dependentSuboptions[module.guid] || [];
    this.dependentSuboptions[module.guid].push({ key: suboptionKey, element });
  }

  getDependentSuboptions(module, suboptionKey) {
    const allDependentSuboptions = this.dependentSuboptions[module.guid] || [];
    return allDependentSuboptions.filter(suboption => {
      return module.config.suboptions[suboption.key].dependent === suboptionKey;
    });
  }

  enableDependentSuboptions(module, suboptionKey) {
    const dependentSuboptions = this.getDependentSuboptions(module, suboptionKey);
    for (const suboption of dependentSuboptions) {
      suboption.element.classList.remove(selectors.suboption.hidden);
    }
  }

  disableDependentSuboptions(module, suboptionKey) {
    const dependentSuboptions = this.getDependentSuboptions(module, suboptionKey);
    for (const suboption of dependentSuboptions) {
      suboption.element.classList.add(selectors.suboption.hidden);
    }
  }

  /* eslint-disable class-methods-use-this */

  handleSearch(event) {
    const query = event.target.value;
    const sections = document.querySelectorAll(`.${selectors.section.wrap}`);
    for (const sectionElem of sections) {
      sectionElem.style.display = '';
      const modules = sectionElem.querySelectorAll(`.${selectors.module.wrap}`);
      let shownModulesCount = 0;
      for (const module of modules) {
        const caption = module.querySelector(`.${selectors.module.caption}`).textContent;
        if (fuzzyMatch(query, caption)) {
          module.style.display = '';
          shownModulesCount++;
        } else {
          module.style.display = 'none';
        }
      }
      if (shownModulesCount === 0) {
        sectionElem.style.display = 'none';
      }
    }
  }

  /* eslint-enable class-methods-use-this */

}

async function saveOptions(newOptions) {
  return setFlattenedOptions(newOptions);
}
function getDefaultOptions() {
  return mergeDefaultOptions({});
}

async function showDialog() {
  const optionsData = await getFlattenedOptions();
  const dialog = new OptionsDialog(optionsData, saveOptions, getDefaultOptions);
  await dialog.constructDialog();
  dialog.open();
}

function optionsDialog() {
  appendDesktopUserMenuLink('MyGann+ Options', showDialog);
  appendMobileUserMenuLink('MyGann+ Options', showDialog);
  insertCss(style.toString());
}

export default registerModule('{6f84183e-607b-4c90-9161-3451b002b541}', {
  name: 'internal.optionsDialog',
  init: optionsDialog,
  showInOptions: false,
});
