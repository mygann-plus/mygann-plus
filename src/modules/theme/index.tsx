import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import constants from '~/utils/style-constants';
import { createElement, insertCss, waitForLoad } from '~/utils/dom';

import style from './style.css';
import enhancedstyle from './specialStyle.css';
import clearstyle from './clear.css';
import fontStyle from './font-style.css';

const DEFAULT_COLOR = constants.primaryMaroon;
const DEFAULT_FONT = '';

// CSS Property Utilities

function setThemeProperty(name: string, color: string) {
  document.documentElement.style.setProperty(`--gocp-theme-${name}`, color);
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

function setThemeColorProperty(name: string, colorObj: Color) {
  const r = colorObj.r > 255 ? 255 : colorObj.r;
  const g = colorObj.g > 255 ? 255 : colorObj.g;
  const b = colorObj.b > 255 ? 255 : colorObj.b;
  const a = colorObj.a > 1 ? 1 : colorObj.a;
  const rgba = `rgba(${r},${g},${b},${a})`;
  setThemeProperty(name, rgba);
}

// Color Utilities

function hexToRgba(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1, // hex only works at full opacity
  };
}
// START OF NATAN
function lighten(col: string, amt: number) {

  let usePound = true;

  // eslint-disable-next-line eqeqeq
  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }

  let num = parseInt(col, 16);

  // eslint-disable-next-line no-bitwise
  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  // eslint-disable-next-line no-bitwise
  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  // eslint-disable-next-line no-bitwise
  let g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  // eslint-disable-next-line no-bitwise
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);

}
function hexToRgb(hex: string) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}
function componentToHex(c: { toString: (arg0: number) => any; }) {
  let hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}
function changeSaturation(sat: number, hex: any) {
  sat /= 100;
  let col = hexToRgb(hex);
  let gray = col.r * 0.3086 + col.g * 0.6094 + col.b * 0.0820;

  col.r = Math.round(col.r * sat + gray * (1 - sat));
  col.g = Math.round(col.g * sat + gray * (1 - sat));
  col.b = Math.round(col.b * sat + gray * (1 - sat));

  let out = rgbToHex(col.r, col.g, col.b);
  return out;

}
function waitForElm(selector: string) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
// END OF NATAN
function createColorObject(base: Color, r: number, g: number, b: number, a: number): Color {
  return {
    r: base.r + r,
    g: base.g + g,
    b: base.b + b,
    a,
  };
}

// Basic functions

function replaceAll(replacetext: string, newtext: string, text: string) {

  while (!text.includes(replacetext)) {

    text.replace(replacetext, newtext);

  }
  return text;

}

// Suboption Validators

// Checks if font exists on Google Fonts
async function fontValidator(font: string) {
  if (!font) {
    return { valid: true };
  }
  const endpoint = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}`;
  try {
    await fetch(endpoint);
    return { valid: true };
  } catch (e) {
    return { valid: false, message: `${font} is not on Google Fonts` };
  }
}

const domQuery = () => document.querySelector('#app-style style');

async function applyColorStyles(color: string, enhance: boolean, dark: boolean, unloaderContext: UnloaderContext) {
  const appStyles = await waitForLoad(domQuery);
  let themeStyles = <style>{ style.toString() }</style>;
  if (!dark) {
    appStyles.after(themeStyles);
  }
  unloaderContext.addRemovable(themeStyles);
  const primaryColor = hexToRgba(color);

  const calendarColor = createColorObject(primaryColor, 0, 0, 0, 0.9);
  const topGradient = createColorObject(primaryColor, 230, 230, 230, 1);
  const selectedBorder = createColorObject(primaryColor, 60, 60, 60, 0.9);
  const navHighlight = createColorObject(primaryColor, 45, 45, 45, 0.3);

  setThemeColorProperty('primary', primaryColor);
  setThemeColorProperty('lighter', calendarColor);
  setThemeColorProperty('top-gradient', topGradient);
  setThemeColorProperty('selected-border', selectedBorder);
  setThemeColorProperty('nav-highlight', navHighlight);
  // }
  const panelBodyDefault = hexToRgba(constants.panelBodyDefault);
  if (enhance) {
    setThemeColorProperty('body-background', createColorObject(primaryColor, 0, 0, 0, 0.15));
    setThemeColorProperty('panel-border', createColorObject(primaryColor, 0, 0, 0, 0.4));
    setThemeColorProperty('panel-head', createColorObject(panelBodyDefault, 0, 0, 0, 0.55));
    setThemeColorProperty('panel-body', createColorObject(panelBodyDefault, 0, 0, 0, 0.7));
    setThemeColorProperty('highlight', createColorObject(primaryColor, 45, 45, 45, 0.3));
  } else {
    setThemeProperty('body-background', constants.bodyBackgroundDefault);
    setThemeProperty('panel-border', constants.panelBorderDefault);
    setThemeProperty('panel-head', constants.panelBodyDefault);
    setThemeProperty('panel-body', constants.panelBodyDefault);
    setThemeProperty('highlight', constants.defaultProgressHighlight);
  }
  if (dark) {
    if (!enhance) {
      let themeStyles2 = <style>{ enhancedstyle.toString() }</style>;
      appStyles.after(themeStyles2);
      unloaderContext.addRemovable(themeStyles2);
      themeStyles.remove();
      themeStyles2 = <style>{ enhancedstyle.toString() }</style>;
      appStyles.after(themeStyles2);
      unloaderContext.addRemovable(themeStyles2);
      let tempstring = replaceAll('#e1c2cb', 'transparent!important', document.querySelector('#app-style > div > style').innerHTML);
      tempstring = replaceAll('#site-nav DIV.subnav UL > li > a.active {background-color: #fff2c0 !important;}', '#site-nav DIV.subnav UL > li > a.active {background-color: transparent !important;}', tempstring);
      tempstring = replaceAll('#880d2f;background-image: -moz-linear-gradient(top, #a64a63, #880d2f); background-image: -ms-linear-gradient(top, #a64a63, #880d2f);background-', 'var(--header)!important;background-image: none; background-image:none;background-', tempstring);
      tempstring = replaceAll('#880d2f;background-image: -moz-linear-gradient(top, #a64a63, #880d2f); background-image: -ms-linear-gradient(top, #a64a63, #880d2f);background-', 'var(--header)!important;background-image: none; background-image:none;background-', tempstring);
      tempstring = replaceAll('#fff2c0', 'var(--main1)', tempstring);
      document.querySelector('#app-style > div > style').innerHTML = tempstring;
      document.querySelector('#app-style > div > style').addEventListener('change', () => {
        let tempstring2 = replaceAll('#e1c2cb', 'transparent!important', document.querySelector('#app-style > div > style').innerHTML);
        tempstring2 = replaceAll('#site-nav DIV.subnav UL > li > a.active {background-color: #fff2c0 !important;}', '#site-nav DIV.subnav UL > li > a.active {background-color: transparent !important;}', tempstring2);
        tempstring2 = replaceAll('#880d2f;background-image: -moz-linear-gradient(top, #a64a63, #880d2f); background-image: -ms-linear-gradient(top, #a64a63, #880d2f);background-', 'var(--header)!important;background-image: none; background-image:none;background-', tempstring2);
        tempstring2 = replaceAll('#fff2c0', 'var(--main1)', tempstring2);
        document.querySelector('#app-style > div > style').innerHTML = tempstring2;

      });

    }
    document.documentElement.style.setProperty('--header', '#000000');
    document.documentElement.style.setProperty('--subheader', '#1E1E1E');
    document.documentElement.style.setProperty('--background', '#121212');
    document.documentElement.style.setProperty('--main1', '#2E2E2E');
    document.documentElement.style.setProperty('--main2', '#424242');
    document.documentElement.style.setProperty('--headercolor', '#a1a1a1');
    document.documentElement.style.setProperty('--subheadercolor', '#a1a1a1');
    document.documentElement.style.setProperty('--backgroundcolor', '#a1a1a1');
    document.documentElement.style.setProperty('--main1color', '#a1a1a1');
    document.documentElement.style.setProperty('--main2color', '#a1a1a1');
  }
}

async function applyClearTheme(url: string, transparency: number, unloaderContext: UnloaderContext) {
  const appStyles = await waitForLoad(domQuery);
  if (window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/schedule' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/progress' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/assignment-center' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/course-requests') {
    waitForElm('#site-top-spacer').then((elm) => {
      document.querySelector('#site-top-spacer').insertAdjacentHTML('afterend', '<div id="e0e2e063-50ac-4287-bc68-d5fa20de986d" class="site-top-spacer site-top-spacer-lower-nav site-top-spacer-lower-nav-desktop f20345f4-b47f-4764-bf21-b4e6d007d26a" style="position: fixed;top: 0%;width: 100%;z-index: 10;height: 19vh!important;background-image: none!important;backdrop-filter: blur(1000px);"></div>');
    });
  } else if (document.querySelector('#site-top-spacer') !== undefined) {
    if (document.getElementById('.f20345f4-b47f-4764-bf21-b4e6d007d26a') === undefined) {
      document.querySelector('#site-top-spacer').insertAdjacentHTML('afterend', '<div id="e0e2e063-50ac-4287-bc68-d5fa20de986d" class="site-top-spacer site-top-spacer-lower-nav site-top-spacer-lower-nav-desktop f20345f4-b47f-4764-bf21-b4e6d007d26a" style="position: fixed;top: 0%;width: 100%;z-index: 10;height: 19vh!important;background-image: none!important;backdrop-filter: blur(1000px);"></div>');
    }
    document.querySelectorAll('.f20345f4-b47f-4764-bf21-b4e6d007d26a').forEach((item) => {
      const a = item as HTMLElement;
      a.style.height = '12.8vh';
    });
  }
  window.addEventListener('popstate', () => {
    if (window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/schedule' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/progress' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/assignment-center' || window.location.href === 'https://gannacademy.myschoolapp.com/app/student#studentmyday/course-requests') {
      waitForElm('#site-top-spacer').then((elm) => {
        document.querySelector('#site-top-spacer').insertAdjacentHTML('afterend', '<div id="e0e2e063-50ac-4287-bc68-d5fa20de986d" class="site-top-spacer site-top-spacer-lower-nav site-top-spacer-lower-nav-desktop f20345f4-b47f-4764-bf21-b4e6d007d26a" style="position: fixed;top: 0%;width: 100%;z-index: 10;height: 19vh!important;background-image: none!important;backdrop-filter: blur(1000px);"></div>');
      });
    } else if (document.querySelector('#site-top-spacer') !== undefined) {
      if (document.getElementById('.f20345f4-b47f-4764-bf21-b4e6d007d26a') === undefined) {
        document.querySelector('#site-top-spacer').insertAdjacentHTML('afterend', '<div id="e0e2e063-50ac-4287-bc68-d5fa20de986d" class="site-top-spacer site-top-spacer-lower-nav site-top-spacer-lower-nav-desktop f20345f4-b47f-4764-bf21-b4e6d007d26a" style="position: fixed;top: 0%;width: 100%;z-index: 10;height: 19vh!important;background-image: none!important;backdrop-filter: blur(1000px);"></div>');
      }
      document.querySelectorAll('.f20345f4-b47f-4764-bf21-b4e6d007d26a').forEach((item) => {
        const a = item as HTMLElement;
        a.style.height = '12.8vh';
      });
    }
  });

  let clearcss = <style>{ clearstyle.toString() }</style>;
  appStyles.after(clearcss);
  unloaderContext.addRemovable(clearcss);
  if (url === '' || url === undefined) {
    document.documentElement.style.setProperty('--url', 'url("https://pbs.twimg.com/profile_images/458793300388884481/i8zzeu_Z_400x400.jpeg")');
  } else {
    document.documentElement.style.setProperty('--url', `url("${url}")`);
  }

  document.documentElement.style.setProperty('--blur', `${transparency}px`);
  document.documentElement.style.setProperty('--blur', `${(transparency * 2)}px`);

}
function applyFontStyles(font: string, unloaderContext: UnloaderContext) {
  const fontStyles = insertCss(fontStyle.toString());
  unloaderContext.addRemovable(fontStyles);

  const fontName = font.replace(/ /g, '+');
  const fontUrl = `https://fonts.googleapis.com/css?family=${fontName}`;
  const fontlink = <link href={fontUrl} rel="stylesheet" />;
  document.head.appendChild(fontlink);
  unloaderContext.addRemovable(fontlink);

  setThemeProperty('font', `"${font}", "Blackbaud Sans","Helvetica Neue",Arial,sans-serif`);
}

function themeMain(options: ThemeSuboptions, unloaderContext: UnloaderContext) {
  const { color, font, enhanced, clear, bgImage, transparency, dark } = options;

  if (clear && !enhanced) {
    applyClearTheme(bgImage, transparency, unloaderContext);
  }
  if (color !== DEFAULT_COLOR && !clear) {
    document.querySelector('body').style.backgroundImage = 'none';
    applyColorStyles(color, enhanced, dark, unloaderContext);
  }
  if (clear && enhanced) {
    document.querySelector('body').style.backgroundImage = 'none';
    applyColorStyles(color, false, dark, unloaderContext);
  }
  if (font !== DEFAULT_FONT) {
    applyFontStyles(font, unloaderContext);
  }
}

// empty unloader to prevent unnecessary reload if no styles were initially applied
function unloadTheme() {}

interface ThemeSuboptions {
  color: string;
  font: string;
  enhanced: boolean;
  clear: boolean;
  bgImage: string;
  // imageScale: number;
  transparency: number;
  dark: boolean;
  // invert: boolean;
}

export default registerModule('{da4e5ba5-d2da-45c1-afe5-83436e5915ec}', {
  name: 'Theme',
  init: themeMain,
  unload: unloadTheme,
  topLevelOption: true,
  suboptions: {
    color: {
      name: 'Color',
      type: 'color',
      defaultValue: DEFAULT_COLOR,
      resettable: true,
    },
    font: {
      name: 'Font',
      type: 'combo',
      description: `
        Chose a font from the list, or type in any font from 
        <a target="_blank" href="https://fonts.google.com">Google Fonts</a>. 
        Leave empty for default.
      `,
      htmlDescription: true,
      defaultValue: DEFAULT_FONT,
      presetValues: [
        DEFAULT_FONT,
        'Abel',
        'Arimo',
        'Roboto',
        'Lato',
        'Fira Sans',
        'Quicksand',
        'Josefin Sans',
        'Karla',
        'Open Sans',
      ],
      validator: fontValidator,
    },
    enhanced: {
      name: 'Enhanced',
      type: 'boolean',
      defaultValue: true,
      description: 'Apply theme color to webpage body',
    },
    clear: {
      name: 'Clear',
      type: 'boolean',
      defaultValue: false,
      description: 'Apply a clear theme to every element. Pick background image and size',
    },
    bgImage: {
      name: 'Background Image',
      type: 'string',
      defaultValue: 'https://pbs.twimg.com/profile_images/458793300388884481/i8zzeu_Z_400x400.jpeg',
      description: 'Insert URL for background image for clear theme',
      dependent: 'clear',
    },
    transparency: {
      name: 'Opacity Amount',
      type: 'number',
      defaultValue: 10,
      description: 'Change opacity (clearness) of clear theme',
      dependent: 'clear',
    },
    dark: {
      name: 'Dark Mode',
      type: 'boolean',
      defaultValue: false,
      description: 'Apply dark mode',
    },
  },
});
