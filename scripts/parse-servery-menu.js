const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const MONTH = 'may';

let dataBuffer = fs.readFileSync(path.join(__dirname, `menus/${MONTH}-menu.pdf`));

pdf(dataBuffer).then((data) => {
  const { text } = data;
  const menuText = text.split('gluten-free')[1];
  const lines = menuText.split('\n').filter(x => Boolean(x.trim()));
  const menu = [];
  for (const line of lines) {
    if (!(Number.isNaN(Number(line)))) {
      const date = Number(line);
      menu.push({ date, items: [] });
    } else {
      let name = line.trim();
      let gf = false;
      let p = false;
      if (name.endsWith('p, gf')) {
        name = name.substring(0, name.length - 5);
        p = true;
        gf = true;
      } else {
        if (name.endsWith('gf')) {
          gf = true;
          name = name.substring(0, name.length - 2);
        }
        if (name.endsWith('p')) {
          name = name.substring(0, name.length - 1);
          p = true;
        }
      }
      if (menu[menu.length - 1]) {
        menu[menu.length - 1].items.push({
          name,
          gf,
          parve: p,
        });
      }
    }
  }
  console.log(JSON.stringify(menu));
}).catch((error) => {
  console.log('Error!', error);
});
