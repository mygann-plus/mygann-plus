import storage from '~/utils/storage';

const COLLAPSE_ASSIGNMENT_SECTIONS_KEY = 'collapse_assignment_sections';
const SCHEMA_VERSION = 1;

async function getHiddenSections(): Promise<string[]> {
  return (
    await storage.get(COLLAPSE_ASSIGNMENT_SECTIONS_KEY, SCHEMA_VERSION)
  ) || [];
}

export async function getIsHidden(courseName: string, sectionId: string) {
  const hiddenSections = await getHiddenSections();
  return hiddenSections.includes(courseName + sectionId);
}

export async function toggleSectionHidden(courseName: string, sectionId: string) {
  const hiddenSections = await getHiddenSections();
  if (hiddenSections.includes(courseName + sectionId)) {
    hiddenSections.splice(hiddenSections.indexOf(courseName + sectionId), 1);
  } else {
    hiddenSections.push(courseName + sectionId);
  }
  return storage.set(COLLAPSE_ASSIGNMENT_SECTIONS_KEY, hiddenSections, SCHEMA_VERSION);
}
