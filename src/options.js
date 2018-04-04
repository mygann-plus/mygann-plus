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
export default function() {
  waitForLoad(() => document.getElementById('notification-label'))
    .then(appendNavLink);
}
