import { waitForLoad, nodeListToArray, insertAfter, insertCss } from '../utils/dom';
import storage from '../utils/storage';
import registerModule from '../utils/module';

import { MODULE_MAP, SECTION_MAP } from '../module-map';

const formatModuleName = name => {
  let n = name.split(/(?=[A-Z])/).join(' ');
  return n.charAt(0).toUpperCase() + n.substring(1);
};

function createOptionsSection(sectionTitle, modules, sectionHref, opts) {
  const sectionWrap = document.createElement('div');
  const title = document.createElement('div');
  const optionsWrap = document.createElement('div');

  sectionWrap.setAttribute('data-gocp-href', sectionHref);
  title.className = 'bb-section-heading';
  title.innerText = sectionTitle;
  optionsWrap.style.padding = '2px 0';

  modules.forEach(({ name, options: moduleOpts }) => {
    if (!moduleOpts.showInOptions) return;

    const label = document.createElement('label');
    const input = document.createElement('input');
    const checkbox = document.createElement('span');
    const caption = document.createElement('span');
    const description = document.createElement('span');

    label.className = 'bb-check-wrapper';
    label.setAttribute('for', name);
    label.setAttribute('data-gocp-module', name);
    label.style.display = 'block';
    input.id = name;
    input.type = 'checkbox';
    input.checked = opts[name];
    checkbox.className = 'bb-check-checkbox';
    caption.style.fontWeight = 'normal';
    caption.style.marginLeft = '10px';
    caption.innerText = formatModuleName(name);
    description.style.paddingLeft = '4px';
    description.style.color = '#9d9d9d';
    description.innerText = moduleOpts.description && `- ${moduleOpts.description}`;

    caption.appendChild(description);
    label.appendChild(input);
    label.appendChild(checkbox);
    label.appendChild(caption);

    optionsWrap.appendChild(label);
  });

  sectionWrap.appendChild(title);
  sectionWrap.appendChild(optionsWrap);

  return sectionWrap;
}

function generateDialogHtml() {
  return `
    <div class="modal bb-modal in" id="gocp_options_modal" style="display: block;" tabindex="-1">
      <div>
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <a class="close fa fa-times" id="gocp_options_close"></a>
              <h1 class="bb-dialog-header">Gann Academy OnCampus+ Options</h1>
            </div>
            <div class="modal-body" style="padding: 0px; overflow-x: hidden; max-height: 532px;">
              <div>
                  <div style="padding:25px;">
                    Enable and Disable Modules
                    <div id="gocp_options_sections"></div>
                  </div>
                  <div style="font-size:12px;padding-left:25px;padding-bottom:20px">
                    Special thanks to Shai Mann-Robsison and Micah Shire-Plumb for beta testing and ideas.
                  </div>
                  <div 
                    class="pull-right" 
                    style="padding-right: 22px; padding-bottom: 13px;"
                  >
                    <a href="#" class="btn btn-link" id="gocp_options_cancel">
                      Cancel
                    </a>
                    <a 
                    href="#"
                    class="btn btn-default btn-primary"
                    style="margin-left: 20px;"
                    id="gocp_options_save"
                  >
                      Save
                    </a>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
function generateBackdropHtml() {
  return '<div class="modal-backdrop in" id="gocp_options_modal-backdrop></div>';
}

const closeModal = e => {
  e.preventDefault();
  window.location.reload();
};

const saveOptions = async e => {
  e.preventDefault();

  // generate options object

  const opts = {};
  const sectionElems = nodeListToArray(document.getElementById('gocp_options_sections').children);
  for (let i = 0; i < sectionElems.length; i++) {
    const href = sectionElems[i].getAttribute('data-gocp-href');
    const moduleElems = sectionElems[i].children[1].children;
    opts[href] = {};
    for (let j = 0; j < moduleElems.length; j++) {
      const module = moduleElems[j].getAttribute('data-gocp-module');
      opts[href][module] = moduleElems[j].children[0].checked;
    }
  }

  await storage.set({ opts });
  alert('Options saved!'); // eslint-disable-line no-alert
  closeModal(e);

};

const loadOptions = async () => {
  for (let i in MODULE_MAP) {
    // created elem-by-elem because embedding HTML will cause event listeners not to work
    if ({}.hasOwnProperty.call(MODULE_MAP, i)) {
      const opts = await storage.get('options');
      let section = createOptionsSection(SECTION_MAP[i], MODULE_MAP[i], i, opts[i]);
      document.getElementById('gocp_options_sections').appendChild(section);
    }
  }
};

async function constructDialog() {
  document.body.innerHTML += generateDialogHtml();
  document.body.innerHTML += generateBackdropHtml();
  loadOptions();

  document.getElementById('gocp_options_close').onclick = closeModal;
  document.getElementById('gocp_options_cancel').onclick = closeModal;
  document.getElementById('gocp_options_save').onclick = saveOptions;
}

function appendNavLink() {
  if (document.getElementById('gocp_options_navlink')) return;

  const menu = document.getElementsByClassName('oneline parentitem last')[0].children[2].children[0];
  const nativeSettingsLink = menu.children[2];

  const li = document.createElement('li');
  const a = document.createElement('a');
  const desc = document.createElement('span');
  const title = document.createElement('span');

  li.id = 'gocp_options_navlink';
  a.href = '#';
  a.className = 'pri-75-bgc-hover black-fgc white-fgc-hover active';
  a.onclick = constructDialog;
  desc.className = 'desc';
  title.className = 'title';
  // TODO: "Gann OnCampus+" or "OnCampus+ Options" (if former, remove css)
  title.innerText = 'OnCampus+ Options';

  desc.appendChild(title);
  a.appendChild(desc);
  li.appendChild(a);
  insertAfter(nativeSettingsLink, li);

  insertCss(`
    .site-header-nav div.subnav li a {
      width: 147px;
    }
  `);
}

function options() {
  waitForLoad(() => (
    document.getElementsByClassName('oneline parentitem last')[0] &&
    document.getElementsByClassName('oneline parentitem last')[0].getElementsByClassName('subnavtop').length
  ))
    .then(appendNavLink);
}

export default registerModule('Options', options, {
  showInOptions: false,
});
