import registerModule from '../utils/module';
import storage from '../utils/storage';
import {
  waitForLoad,
  nodeListToArray,
  insertAfter,
  insertCss,
  createElementFromHTML,
} from '../utils/dom';

import { MODULE_MAP, SECTION_MAP } from '../module-map';
import Dialog from '../utils/dialogue';

const identifiers = {
  extraOptions: 'gocp_options_extra-options',
  suboptionKeyAttribute: 'gocp_options_suboption-key',
};

const formatModuleName = name => {
  let n = name.split(/(?=[A-Z])/).join(' ');
  return n.charAt(0).toUpperCase() + n.substring(1);
};
const formatDescription = desc => desc.replace(/\n/g, ' ');

function toggleSuboptions(suboptions) {
  const isOpen = suboptions.classList.contains('open');
  suboptions.classList.remove(isOpen ? 'open' : 'closed');
  suboptions.classList.add(isOpen ? 'closed' : 'open');
}

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
        optionElem.innerText = val;
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
  input.style.marginLeft = '7px';
  input.style.display = 'inline-block';

  label.innerText = `${option.name}:`;
  label.style.fontWeight = 'normal';
  label.style.marginLeft = '10px';
  label.setAttribute('gocp_options_suboption-key', key);
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
  title.innerText = sectionTitle;
  optionsWrap.style.padding = '2px 0';

  modules.forEach(({ name, config }) => {
    if (!config.showInOptions) return;

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

    wrap.style.background = '#f0efef';
    wrap.style.marginBottom = '5px';
    wrap.setAttribute('data-gocp-module', name);
    top.style.padding = '10px';
    label.className = 'bb-check-wrapper';
    label.setAttribute('for', name);
    label.style.display = 'inline-block';
    label.style.maxWidth = '95%';
    label.style.margin = '0';
    input.id = name;
    input.type = 'checkbox';
    input.checked = opts[name].enabled;
    checkbox.className = 'bb-check-checkbox';
    caption.style.fontWeight = 'normal';
    caption.style.marginLeft = '10px';
    caption.innerText = formatModuleName(name);
    description.style.paddingLeft = '4px';
    description.style.color = '#9d9d9d';
    description.innerText = config.description && `- ${formatDescription(config.description)}`;
    expandLink.style.color = 'black';
    expandLink.style.float = 'right';
    expandLink.style.cursor = 'pointer';
    expandLink.style.maxWidth = '5%';
    expandLink.addEventListener('click', () => toggleSuboptions(extraOptions));
    chevron.className = 'fa fa-chevron-down';
    chevron.style.fontSize = '17px';
    extraOptions.className = `${identifiers.extraOptions} closed`;

    caption.appendChild(description);
    expandLink.appendChild(chevron);
    label.appendChild(input);
    label.appendChild(checkbox);
    label.appendChild(caption);
    top.appendChild(label);
    wrap.appendChild(top);

    if (Object.keys(config.options).length > 0) {
      const suboptions = [];
      for (let i in config.options) {
        if (config.options.hasOwnProperty(i)) {
          suboptions.push(createSuboption(i, opts[name].options[i], config.options[i]));
        }
      }
      suboptions.forEach(suboption => extraOptions.appendChild(suboption));
      top.appendChild(expandLink);
      wrap.appendChild(extraOptions);
    }

    optionsWrap.appendChild(wrap);
  });

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

  const sectionElems = nodeListToArray(document.getElementById('gocp_options_sections').children);
  for (let i = 0; i < sectionElems.length; i++) {
    const href = sectionElems[i].getAttribute('data-gocp-href');
    const moduleElems = sectionElems[i].children[1].children;
    opts[href] = {};
    for (let j = 0; j < moduleElems.length; j++) {
      const module = moduleElems[j].getAttribute('data-gocp-module');
      opts[href][module] = {
        enabled: moduleElems[j].children[0].children[0].children[0].checked,
        options: {},
      };
      const suboptions = MODULE_MAP[href].find(m => m.name === module).config.options;
      for (let suboptKey in suboptions) {
        const query = `label[${identifiers.suboptionKeyAttribute}="${suboptKey}"`;
        const label = moduleElems[j].querySelector(query);
        const value = getSuboptionValue(label, suboptions[suboptKey].type);
        opts[href][module].options[suboptKey] = value;
      }
    }
  }

  await storage.set({ options: opts });

};

const loadOptions = async () => {
  const opts = await storage.get('options');
  for (let i in MODULE_MAP) {
    // created elem-by-elem because embedding HTML will cause event listeners not to work
    if ({}.hasOwnProperty.call(MODULE_MAP, i)) {
      let section = createOptionsSection(SECTION_MAP[i], MODULE_MAP[i], i, opts[i]);
      document.getElementById('gocp_options_sections').appendChild(section);
    }
  }
};

async function constructDialog() {

  const dialog = new Dialog('Gann OnCampus+ Options', createElementFromHTML(generateDialogHtml()), {
    onSave: saveOptions,
    backdrop: true,
  });
  dialog.open();
  loadOptions();

}

function appendNavLink() {
  if (document.getElementById('gocp_options_navlink')) return;

  const menu = document.getElementsByClassName('oneline parentitem last')[0].children[2].firstChild;
  const nativeSettingsLink = menu.children[2];

  const li = document.createElement('li');
  const a = document.createElement('a');
  const desc = document.createElement('span');
  const title = document.createElement('span');

  li.id = 'gocp_options_navlink';
  a.href = '#';
  a.className = 'pri-75-bgc-hover black-fgc white-fgc-hover active';
  a.addEventListener('click', e => {
    e.preventDefault();
    constructDialog();
  });
  desc.className = 'desc';
  title.className = 'title';
  title.innerText = 'OnCampus+ Options';

  desc.appendChild(title);
  a.appendChild(desc);
  li.appendChild(a);
  insertAfter(nativeSettingsLink, li);

}

function appendMobileNavLink() {
  if (document.getElementById('gocp_options_mobilenavlink')) return;

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
  insertAfter(nativeSettingsLink, mobileNav);
}

function insertStyles() {
  insertCss(`
    .site-header-nav div.subnav li a {
      width: 147px;
    }
    .gocp_options_extra-options.closed {
      display: none;
    }
    gocp_options_extra-options.open {
      display: block;
    }
  `);
}

const domQuery = {
  header: () => (
    document.getElementsByClassName('oneline parentitem last')[0] &&
    document.getElementsByClassName('oneline parentitem last')[0]
      .getElementsByClassName('subnavtop').length
  ),
  mobileMenu: () => document.getElementById('mobile-account-nav'),
};

function options() {
  waitForLoad(domQuery.header).then(appendNavLink);

  waitForLoad(domQuery.mobileMenu).then(() => {
    document.getElementById('mobile-account-nav').addEventListener('click', () => {
      waitForLoad(() => (
        document.getElementsByClassName('app-mobile-level').length &&
        document.getElementById('mobile-settings-link')
      ))
        .then(appendMobileNavLink);
    });
  });
  insertStyles();
}

export default registerModule('Options', options, {
  showInOptions: false,
});
