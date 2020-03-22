import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import constants from '~/utils/style-constants';
import { createElement, insertCss, waitForLoad } from '~/utils/dom';

import style from './style.css';
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
}

function setThemeColorProperty(name: string, colorObj: Color) {
  const r = colorObj.r > 255 ? 255 : colorObj.r;
  const g = colorObj.g > 255 ? 255 : colorObj.g;
  const b = colorObj.b > 255 ? 255 : colorObj.b;
  const rgb = `rgb(${r},${g},${b})`;
  setThemeProperty(name, rgb);
}

// Color Utilities

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function createColorObject(base: Color, r: number, g: number, b: number) {
  return {
    r: base.r + r,
    g: base.g + g,
    b: base.b + b,
  };
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

async function applyColorStyles(color: string, unloaderContext: UnloaderContext) {
  const appStyles = await waitForLoad(domQuery);

  const themeStyles = <style>{ style.toString() }</style>;
  appStyles.after(themeStyles);
  unloaderContext.addRemovable(themeStyles);

  const primaryColor = hexToRgb(color);
  const calendarColor = createColorObject(primaryColor, 30, 30, 30);
  const topGradient = createColorObject(primaryColor, 230, 230, 230);
  const selectedBorder = createColorObject(primaryColor, 90, 90, 90);

  setThemeColorProperty('primary', primaryColor);
  setThemeColorProperty('lighter', calendarColor);
  setThemeColorProperty('top-gradient', topGradient);
  setThemeColorProperty('selected-border', selectedBorder);
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

function theme(options: ThemeSuboptions, unloaderContext: UnloaderContext) {
  const { color, font } = options;

  if (color !== DEFAULT_COLOR) {
    applyColorStyles(color, unloaderContext);
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
}

export default registerModule('{da4e5ba5-d2da-45c1-afe5-83436e5915ec}', {
  name: 'Theme',
  init: theme,
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
  },
});
