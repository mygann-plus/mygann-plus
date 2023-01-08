import registerModule from '~/core/module';

function pfp(person: string, id1: string, url1: string) {
  this.name = person;
  this.id = id1;
  this.url = url1;
}
let currentId: number;

fetch('https://gannacademy.myschoolapp.com/api/webapp/context').then((response) => response.json()).then((data) => { currentId = data.MasterUserInfo.UserId; });
const pfplist = [

  new (pfp as any)('gedalya', '6244383', 'https://i.etsystatic.com/27152142/r/il/5c1415/3021507188/il_fullxfull.3021507188_r8ss.jpg'),
  new (pfp as any)('yakir', '6784562', 'https://lh3.googleusercontent.com/vnZeg0VV6F2xBO2tXemg_T_B-Fn2kRmN4EJ2tz1qfjRIl2By0bg-c7G0t0-BmxMBhK44yY22ObDNES8Xrnzm4dyVaH31tIRI51rKBUGVhSIU7LZvY_yFq_lQrd1VyBKiKOVHhNljiQ=w2400'),
];

function changepfps() {
  if (currentId === 6784542 || currentId === 6244383 || currentId === 6784562) {

    if (window.MutationObserver) {

      const observer = new MutationObserver(((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
          // @ts-ignore
            if (typeof node.getElementsByTagName !== 'function') {
              return;
            }
            // @ts-ignore
            let imgs = node.getElementsByTagName('img');
            // eslint-disable-next-line vars-on-top, no-var
            for (var value of imgs) {
              const handleImageLoad = () => {
                pfplist.forEach((item: any) => {
                  if (value.src.includes(item.id)) {
                    value.src = item.url;
                  }
                });
                value.removeEventListener('load', handleImageLoad);

              };
              pfplist.forEach((item: any) => {
                if (value.src.includes(item.id)) {
                  value.src = item.url;
                }
              });
              if (!value.complete) {
                value.addEventListener('load', handleImageLoad);
              }
            }
          });
        });
      }));
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

export default registerModule('{e7ba8bd9-6e08-426d-a9e4-b8a07b34abf0}', {
  name: 'changepfps',
  showInOptions: false,
  init: changepfps,
  main: changepfps,
  unload: changepfps,
});
