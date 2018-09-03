/* eslint-disable import/prefer-default-export */

export function getTableRowColumnContent(assignmentRow, columnHeading) {
  return assignmentRow.querySelector(`[data-heading="${columnHeading}"]`).textContent.trim();
}
