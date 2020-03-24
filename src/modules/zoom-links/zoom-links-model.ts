import storage from '~/utils/storage';

const ZOOM_LINKS_KEY = 'zoom_links';
const SCHEMA_VERSION = 1;

/*
  SCHEMA v1:
  {
    links: {
      id: link
    }
  }
*/

export interface ZoomLinks {
  [id: string]: string;
}

export async function getZoomLinks(): Promise<ZoomLinks> {
  const data = await storage.get(ZOOM_LINKS_KEY, SCHEMA_VERSION);
  return data ? data.links : {};
}

// links can be cached to prevent multiple async calls
export async function getZoomLink(id: string, links?: ZoomLinks) {
  const allLinks = links || await getZoomLinks();
  return allLinks[id];
}

export async function setZoomLink(id: string, link: string) {
  const links = await getZoomLinks();
  return storage.set(ZOOM_LINKS_KEY, {
    links: {
      ...links,
      [id]: link,
    },
  }, SCHEMA_VERSION);
}

export async function removeZoomLink(id: string) {
  const links = await getZoomLinks();
  delete links[id];
  return storage.set(ZOOM_LINKS_KEY, { links }, SCHEMA_VERSION);
}

export async function addZoomLinksChangeListener(listener: (links: ZoomLinks) => void) {
  storage.addChangeListener<{ links: ZoomLinks }>(ZOOM_LINKS_KEY, ({ newValue }) => {
    listener(newValue.links);
  });
}
