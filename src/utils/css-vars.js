import colors from './colors';

function formatVariableName(jsName) {
  return `--${jsName.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;
}

export default function setCssVars() {
  for (const varName in colors) {
    document.documentElement.style.setProperty(formatVariableName(varName), colors[varName]);
  }
}
