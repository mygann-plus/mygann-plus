/* eslint-disable import/prefer-default-export */

export function getTableRowColumnContent(assignmentRow: HTMLElement, columnHeading: string) {
  if (assignmentRow.querySelector(`[data-heading="${columnHeading}"]`)) {
    return assignmentRow.querySelector(`[data-heading="${columnHeading}"]`).textContent.trim();
  }
  return '';
}
