import registerModule from '~/core/module';

// move the title text when it's too long
function scrollTitle() {
  setInterval(() => {
    let currentTitle = document.title;
    currentTitle += ` ${currentTitle[0]}`
  }, 0.05);
}

async function titleScrollMain() {
  
}

function unloadTitleScroll() {

}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Display class time remaining in tab title',
  defaultEnabled: false,
  suboptions: {},
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
