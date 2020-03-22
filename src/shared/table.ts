/* eslint-disable import/prefer-default-export */

export function getTableRowColumnContent(assignmentRow: HTMLElement, columnHeading: string) {
  return assignmentRow.querySelector(`[data-heading="${columnHeading}"]`).textContent.trim();
}
