import { waitForLoad, nodeListToArray } from './utils/dom';
import storage from './utils/storage';
import { MODULE_MAP, SECTION_MAP } from './module-map';

const formatModuleName = name => {
  let n = name.split(/(?=[A-Z])/).join(' ');
  return n.charAt(0).toUpperCase() + n.substring(1);
};

function createOptionsSection(sectionTitle, modules, sectionHref, options) {
  const sectionWrap = document.createElement('div');
  const title = document.createElement('div');
  const optionsWrap = document.createElement('div');

  sectionWrap.setAttribute('data-gocp-href', sectionHref);
  title.className = 'bb-section-heading';
  title.innerText = sectionTitle;
  optionsWrap.style.padding = '2px 0';

  modules.forEach(({ name }) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const checkbox = document.createElement('span');
    const caption = document.createElement('span');

    label.className = 'bb-check-wrapper';
    label.setAttribute('for', name);
    label.setAttribute('data-gocp-module', name);
    label.style.display = 'block';
    input.id = name;
    input.type = 'checkbox';
    input.checked = options[name];
    checkbox.className = 'bb-check-checkbox';
    caption.style.fontWeight = 'normal';
    caption.style.marginLeft = '10px';
    caption.innerText = formatModuleName(name);

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

const closeModal = e => {
  e.preventDefault();
  const modal = document.getElementById('gocp_options_modal');
  if (modal) {
    document.body.removeChild(modal);
  }
  window.location.reload();
};
const loadOptions = async () => {
  for (let i in MODULE_MAP) {
    // created elem-by-elem because embedding HTML will cause event listeners not to work
    if ({}.hasOwnProperty.call(MODULE_MAP, i)) {
      const options = await storage.get('options');
      let section = createOptionsSection(SECTION_MAP[i], MODULE_MAP[i], i, options[i]);
      document.getElementById('gocp_options_sections').appendChild(section);
    }
  }
};

async function constructDialog() {
  document.body.innerHTML += generateDialogHtml();
  loadOptions();

  document.getElementById('gocp_options_close').onclick = closeModal;
  document.getElementById('gocp_options_cancel').onclick = closeModal;
  document.getElementById('gocp_options_save').onclick = saveOptions;
}

function appendNavLink() {
  const sidebar = document.getElementById('settings-container');
  const li = document.createElement('LI');
  const a = document.createElement('A');
  a.id = 'privacy-label';
  a.href = window.location.href;
  a.onclick = constructDialog;
  a.innerText = 'Gann OnCampus+';
  li.appendChild(a);
  sidebar.appendChild(li);
}

export default function() {
  waitForLoad(() => document.getElementById('notification-label'))
    .then(appendNavLink);
}
