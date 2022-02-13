import storage from '~/utils/storage';
import { fetchApi } from '~/utils/fetch';

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

async function guessZoomLink(classId: string) {
  const zoomLinkRegex = /https:\/\/gannacademy.zoom.us\/(j\/\d{10})|(my\/[A-Za-z0-9.]+)/;

  let zoomLink;

  const classLinks = await fetchApi(`/api/link/forsection/${classId}/?format=json&editMode=false&active=false&future=false&expired=false&contextLabelId=2`);
  zoomLink = classLinks.find((link: any) => zoomLinkRegex.test(link.Url));
  if (zoomLink) return zoomLink.Url;

  const classAnnouncements = await fetchApi(`/api/announcement/forsection/${classId}/?format=json&editMode=false&active=true&future=false&expired=false&contextLabelId=2`);
  for (let announcement of classAnnouncements) {
    zoomLink = zoomLinkRegex.exec(announcement.Description); // check the announcement description
    if (zoomLink) return zoomLink[0]; // zoomLink would be null or a regex match array, with the first element being the link

    zoomLink = zoomLinkRegex.exec(announcement.Name); // check the announcement name
    if (zoomLink) return zoomLink[0];
  }
}

export async function getZoomLinks(): Promise<ZoomLinks> {
  const data = await storage.get(ZOOM_LINKS_KEY, SCHEMA_VERSION);
  return data ? data.links : {};
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

// links can be cached to prevent multiple async calls
export async function getZoomLink(id: string, links?: ZoomLinks) {
  const allLinks = links || await getZoomLinks();
  return allLinks[id] || guessZoomLink(id);
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
