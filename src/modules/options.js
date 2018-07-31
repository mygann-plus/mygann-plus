import registerModule from '../utils/module';
import storage from '../utils/storage';
import {
  waitForLoad,
  insertCss,
  createElementFromHTML,
} from '../utils/dom';

import { MODULE_MAP, SECTION_MAP } from '../module-map';
import Dialog from '../utils/dialogue';

const selectors = {
  extraOptions: 'gocp_options_extra-options',
  suboptionKeyAttribute: 'data-gocp_options_suboption-key',
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

function createSuboption(key, value, option) {
  const label = document.createElement('label');
  let input;

  switch (option.type) {
    case 'string':
      input = document.createElement('input');
      break;
    case 'number':
      input = document.createElement('input');
      input.type = 'number';
      if (option.min !== undefined) input.min = option.min;
      break;
    case 'enum':
      input = document.createElement('select');
      option.enumValues.forEach(val => {
        const optionElem = document.createElement('option');
        optionElem.value = val;
        optionElem.textContent = val;
        input.appendChild(optionElem);
      });
      break;
    default:
      input = document.createElement('input');
  }

  input.value = value;
  if (option.validator) {
    let pastValue = value;
    input.addEventListener('change', () => {
      const val = option.type === 'number' ? Number(input.value) : input.value;
      if (!option.validator(val)) {
        input.value = pastValue;
      } else {
        pastValue = input.value;
      }
    });
  }
  input.className = selectors.suboption.input;
  label.className = selectors.suboption.label;

  label.textContent = `${option.name}:`;
  label.setAttribute(selectors.suboptionKeyAttribute, key);
  label.appendChild(input);


  return label;
}

function createOptionsSection(sectionTitle, modules, sectionHref, opts) {
  const sectionWrap = document.createElement('div');
  const title = document.createElement('div');
  const optionsWrap = document.createElement('div');

  sectionWrap.setAttribute('data-gocp-href', sectionHref);
  sectionWrap.style.marginTop = '10px';
  title.className = 'bb-section-heading';
  title.textContent = sectionTitle;
  optionsWrap.style.padding = '2px 0';

  for (const { name, config } of modules) {
    if (!config.showInOptions) continue;

    const wrap = document.createElement('div');
    const top = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const checkbox = document.createElement('span');
    const caption = document.createElement('span');
    const description = document.createElement('span');
    const expandLink = document.createElement('a');
    const chevron = document.createElement('i');
    const extraOptions = document.createElement('div');

    wrap.setAttribute('data-gocp-module', name);
    wrap.className = selectors.module.wrap;
    top.className = selectors.module.top;
    label.classList.add('bb-check-wrapper', selectors.module.label);
    label.setAttribute('for', name);
    input.id = name;
    input.type = 'checkbox';
    input.checked = opts[name].enabled;
    input.className = selectors.module.input;
    checkbox.classList.add('bb-check-checkbox', selectors.module.checkbox);
    caption.textContent = formatModuleName(name);
    caption.className = selectors.module.caption;
    description.textContent = config.description && `- ${formatDescription(config.description)}`;
    description.className = selectors.module.description;
    expandLink.addEventListener('click', () => extraOptions.classList.toggle('open'));
    expandLink.className = selectors.module.expandLink;
    chevron.classList.add('fa', 'fa-chevron-down', selectors.module.chevron);
    extraOptions.className = `${selectors.extraOptions}`;

    caption.appendChild(description);
    expandLink.appendChild(chevron);
    label.appendChild(input);
    label.appendChild(checkbox);
    label.appendChild(caption);
    top.appendChild(label);
    wrap.appendChild(top);

    if (Object.keys(config.options).length > 0) {
      const suboptions = [];
      for (const i in config.options) {
        suboptions.push(createSuboption(i, opts[name].options[i], config.options[i]));
      }
      suboptions.forEach(suboption => extraOptions.appendChild(suboption));
      top.appendChild(expandLink);
      wrap.appendChild(extraOptions);
    }

    optionsWrap.appendChild(wrap);
  }

  sectionWrap.appendChild(title);
  sectionWrap.appendChild(optionsWrap);

  return sectionWrap;
}

function generateDialogHtml() {
  return `
    <div>
      <div>
        <div id="gocp_options_sections"></div>
      </div>
      <div style="font-size:13px; margin-top: 10px;">
        Special thanks to Shai Mann-Robsison and Micah Shire-Plumb for beta testing and ideas.
      </div>
    </div>
  `;
}

function getSuboptionValue(label) {
  return label.children[0].value;
}

const saveOptions = async () => {

  // generate options object
  const opts = {};

  const sectionElems = document.getElementById('gocp_options_sections').children;

  for (const sectionElem of sectionElems) {
    const href = sectionElem.getAttribute('data-gocp-href');
    const moduleElems = sectionElem.children[1].children;
    opts[href] = {};

    for (const moduleElem of moduleElems) {
      const module = moduleElem.getAttribute('data-gocp-module');
      opts[href][module] = {
        enabled: moduleElem.children[0].children[0].children[0].checked,
        options: {},
      };
      const suboptions = MODULE_MAP[href].find(m => m.name === module).config.options;
      for (const suboptKey in suboptions) {
        const query = `label[${selectors.suboptionKeyAttribute}="${suboptKey}"`;
        const label = moduleElem.querySelector(query);
        const value = getSuboptionValue(label, suboptions[suboptKey].type);
        opts[href][module].options[suboptKey] = value;
      }
    }
  }

  await storage.set({ options: opts });

};

const loadOptions = async () => {
  const sectionsWrap = document.getElementById('gocp_options_sections');
  sectionsWrap.innerHTML = '';

  const opts = await storage.get('options');
  for (const sectionName in MODULE_MAP) {
    const section = createOptionsSection(
      SECTION_MAP[sectionName],
      MODULE_MAP[sectionName],
      sectionName,
      opts[sectionName],
    );
    sectionsWrap.appendChild(section);
  }
};

const resetOptions = async () => {

  if (!window.confirm('Are you sure you want to reset all options?')) return; // eslint-disable-line no-alert, max-len

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

  await storage.set({ options: opts });
  loadOptions();
};

async function constructDialog() {
  const dialog = new Dialog('Gann OnCampus+ Options', createElementFromHTML(generateDialogHtml()), {
    onSave: saveOptions,
    onRight: resetOptions,
    rightButton: '<a href="#">Reset Options</a>',
  });
  dialog.open();
  loadOptions();
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
    constructDialog();
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
  mobileNav.children[0].addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('app').click(); // hide menu by clicking out
    constructDialog();
  });
  const nativeSettingsLink = document.getElementById('mobile-settings-link');
  nativeSettingsLink.after(mobileNav);
}

function insertStyles() {
  insertCss(`
    .site-header-nav div.subnav li a {
      width: 147px;
    }
    .gocp_options_extra-options {
      display: none;
    }
    .gocp_options_extra-options.open {
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
