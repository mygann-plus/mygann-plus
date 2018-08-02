import registerModule from '../utils/module';
import storage from '../utils/storage';
import {
  waitForLoad,
  insertCss,
  createElementFromHTML,
} from '../utils/dom';

import { MODULE_MAP, SECTION_MAP } from '../module-map';
import Dialog from '../utils/dialog';

const selectors = {
  suboptionKeyAttribute: 'data-gocp_options_suboption-key',
  section: {
    wrap: 'gocp_options_section-wrap',
    title: 'gocp_options_section-title',
    optionsWrap: 'gocp_options_section-option-wrap',
  },
  module: {
    wrap: 'gocp_options_module-wrap',
    top: 'gocp_options_module-top',
    label: 'gocp_options_module-label',
    input: 'gocp_options_module-input',
    caption: 'gocp_options_module-caption',
    checkbox: 'gocp_options_module-checkbox',
    description: 'gocp_options_module-description',
    expandLink: 'gocp_options_module-expand-link',
    chevron: 'gocp_options_module-chevron',
    extraOptions: 'gocp_options_module-extra-options',
  },
  suboption: {
    input: 'gocp_options_suboption-input',
    label: 'gocp_options_suboption-label',
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
      if (suboption.min && numValue < suboption.min) return false;
      if (suboption.max && numValue > suboption.max) return false;
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
    const sectionWrap = document.createElement('div');
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

    const sectionView = createElementFromHTML(`
      <div class="${selectors.section.wrap}">
        <div class="bb-section-heading ${selectors.section.title}">${publicName}</div>
        <div class="${selectors.section.optionsWrap}"></div>
      </div>
    `);

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

    const html = `
      <div class=${selectors.module.wrap}>
        <div class="${selectors.module.top}">
          <label class="bb-check-wrapper ${selectors.module.label}" for="${module.name}">
            <input type="checkbox" ${moduleState.enabled ? 'checked' : ''} class="${selectors.module.input}" name="${module.name}"/>
            <span class="bb-check-checkbox ${selectors.module.checkbox}"></span>
            <span class="${selectors.module.caption}">
              ${formatModuleName(module.name)}
              ${module.config.description && `
                <span class="${selectors.module.description}">
                  - ${formatDescription(module.config.description)}
                </span>
              `}
            </span>
          </label>
        </div>
      </div>
    `;

    const moduleView = createElementFromHTML(html);

    moduleView.querySelector(`.${selectors.module.input}`).addEventListener('change', ({ target }) => {
      moduleState.enabled = target.checked;
    });

    if (Object.keys(module.config.options).length) {
      const expandLink = createElementFromHTML(`
        <a href="#" class="${selectors.module.expandLink}">
          <i class="fa fa-chevron-down ${selectors.module.chevron}"></i>
        </a>
      `);
      const extraOptions = createElementFromHTML(`
        <div class="${selectors.module.extraOptions}"></div>
      `);

      expandLink.addEventListener('click', e => {
        e.preventDefault();
        extraOptions.classList.toggle('open');
      });
      for (const suboption in module.config.options) {
        const suboptionView = this.createSuboptionView(sectionHash, module, suboption);
        extraOptions.appendChild(suboptionView);
      }

      moduleView.querySelector(`.${selectors.module.top}`).appendChild(expandLink);
      moduleView.appendChild(extraOptions);
    }


    return moduleView;
  }

  createSuboptionView(sectionHash, module, key) {
    const suboption = module.config.options[key];
    const value = this.state[sectionHash][module.name].options[key];
    let input;

    switch (suboption.type) {
      case 'string':
        input = createElementFromHTML('<input />');
        break;
      case 'number':
        input = createElementFromHTML(`<input type="number" min=${suboption.min} max=${suboption.max}/>`);
        break;
      case 'enum':
        input = createElementFromHTML(`
          <select>
            ${suboption.enumValues.map(val => `
              <option value=${val}>${val}</option>
            `).join('')}
          </select>
        `);
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

    const label = createElementFromHTML(`
      <label class=${selectors.suboption.label}>
        ${suboption.name}:
      </label>
    `);
    label.appendChild(input);

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

function appendNavLink() {
  if (document.getElementById('gocp_options_navlink')) return;

  const menu = document.querySelector('.oneline.parentitem.last > :nth-child(3) > :first-child');
  const nativeSettingsLink = menu.children[2];

  const html = `
    <li id="gocp_options_navlink">
      <a href="#" class="pri-75-bgc-hover black-fgc white-fgc-hover active">
        <span class="desc">
          <span class="title">OnCampus+ Options</span>
        </span>
      </a>
    </li>
  `;

  const link = createElementFromHTML(html);
  link.firstElementChild.addEventListener('click', e => {
    e.preventDefault();
    showDialog();
  });
  nativeSettingsLink.after(link);

}

function appendMobileNavLink() {
  if (document.querySelector('#gocp_options_mobilenavlink')) return;

  const mobileNavLinkHtml = `
    <li>
      <a href="#" id="gocp_options_mobilenavlink">OnCampus+ Options</a>
    </li>
  `;
  const mobileNav = createElementFromHTML(mobileNavLinkHtml);
  mobileNav.firstElementChild.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('app').click(); // hide menu by clicking out
    showDialog();
  });
  const nativeSettingsLink = document.getElementById('mobile-settings-link');
  nativeSettingsLink.after(mobileNav);
}

function insertStyles() {
  insertCss(`
    .site-header-nav div.subnav li a {
      width: 147px;
    }
    .${selectors.section.wrap} {
      margin-top: 10px;
    }
    .${selectors.section.optionsWrap} {
      padding: 2px 0;
    }
    .${selectors.module.extraOptions} {
      display: none;
    }
    .${selectors.module.extraOptions}.open {
      display: block;
    }
    
    .${selectors.module.wrap} {
      background: #f0efef;
      margin-bottom: 5px;
    }

    .${selectors.module.top} {
      padding: 10px;
    }
    
    .${selectors.module.label} {
      display: inline-block;
      max-width: 95%;
      margin: 0;
    }
    
    .${selectors.module.caption} {
      font-weight: normal; 
      margin-left: 10px;
    }

    .${selectors.module.chevron} {
      font-size: 17px;
    }
    
    .${selectors.module.description} {
      padding-left: 4px;
      color: #9d9d9d;
    }
    
    .${selectors.module.expandLink} {
      max-width: 5%;
      color: black;
      float: right;
      cursor: pointer;
    }


    .${selectors.suboption.input} {
      margin-left: 7px;
      display: inline-block;
    }

    .${selectors.suboption.label} {
      font-weight: normal;
      margin-left: 10px;
    }
  `);
}

const domQuery = {
  header: () => document.querySelector('.oneline.parentitem.last .subnavtop'),
  mobileMenu: () => document.querySelector('#mobile-account-nav'),
};

function options() {
  waitForLoad(domQuery.header).then(appendNavLink);

  waitForLoad(domQuery.mobileMenu).then(() => {
    document.querySelector('#mobile-account-nav').addEventListener('click', async () => {
      await waitForLoad(() => (
        document.querySelector('.app-mobile-level') &&
        document.querySelector('#mobile-settings-link')
      ));
      appendMobileNavLink();
    });
  });

  insertStyles();
}

export default registerModule('Options', options, {
  showInOptions: false,
});
