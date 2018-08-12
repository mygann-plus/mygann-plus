import constants from './style-constants';

function formatVariableName(jsName) {
  return `--${jsName.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;
}

export default function setCssVars() {
  for (const varName in constants) {
    document.documentElement.style.setProperty(formatVariableName(varName), constants[varName]);
  }
}
