export function waitForLoad(condition, optionalDocument) {

  const document = optionalDocument || window.document;

  return new Promise(res => {

    if (condition()) {
      return res();
    }

    const observer = new MutationObserver(() => {
      if (condition()) {
        res();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

}

export function constructButton(innerText, id, iClassName, onclick) {
  let elem = document.createElement('button');
  let i = document.createElement('i');
  let text = document.createTextNode(innerText);
  elem.id = id;
  elem.className = 'btn btn-sm btn-default';
  i.className = iClassName;
  elem.style = 'color:#000';
  i.style = 'visibility: visible; margin-right: 5px';
  if (iClassName) {
    elem.appendChild(i);
  }
  elem.appendChild(text);
  elem.addEventListener('click', onclick);
  return elem;
}

export function nodeListToArray(nodeList) {
  return [].slice.call(nodeList);
}

export function hasParentWithClassName(element, classnames) {
  const containsClass = c => element.className.split(' ').indexOf(c) >= 0;
  if (element.className && classnames.filter(containsClass).length > 0) {
    return true;
  }
  return element.parentNode && hasParentWithClassName(element.parentNode, classnames);
}

export function insertCss(css) {
  const styleElem = document.createElement('style');
  styleElem.textContent = css;
  document.head.appendChild(styleElem);
  return {
    remove() {
      if (styleElem && styleElem.parentNode) {
        styleElem.remove();
      }
    },
  };
}

export function createElementFromHTML(htmlString, parent) {
  parent = parent || document.createElement('div');
  parent.innerHTML = htmlString.trim();
  return parent.firstChild;
}

export function addEventListeners(nodes, event, callback) {
  for (const node of nodes) {
    node.addEventListener(event, callback);
  }
}
