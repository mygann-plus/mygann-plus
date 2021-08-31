import registerModule from '~/core/module';

// move the title text when it's too long
function scrollTitle() {

}

async function titleScrollMain() {

}

function unloadTitleScroll() {

}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Title Info',
  description: 'Show more information in the tab title',
  defaultEnabled: false,
  suboptions: {},
  init: titleScrollMain,
  unload: unloadTitleScroll,
});
