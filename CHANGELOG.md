## 0.6.0 (UNRELEASED) [must clear stored options]
### Added
- "Coming Up" module, which shows a preview of the next day's events in the schedule.
- "Favorites" module
- "Day Schedule Button" module, which adds a button tutton to return to the day view in the month & week schedule view.
- "One Click Login" module, which restores the login page to before the summer of 2018 update with only one login button (as opposed to post-2018 version, which requires two button clicks: "next", then "login")
- Previous graded course button added to Next Graded Course module.
- Hide ungraded courses feature in Filter Courses module.
- Support for mobile menu in Search Classes Menu.
- Three options for Filter Website in Main Search: collapse, move to bottom, and remove.
- Maximum messages to preview and dissapear time in message preview is now configurable.
- New button in Message Preview to go to the first link found in the body of the message.

### Changed
- Extension renamed to "Gann OnCampus+"
- "Courses Search" module renamed to "Courses Filter"
- Options moved into desktop and mobile main dropdown
- Option dialog improvements
  - Popup box no longer appears and page no longer reloads after saving.
  - Small look & feel tweaks, including font size, spacing, colors, and backdrop.
  - Longer descriptions for Filter Website from Search, One Click Login, and Inline Assignment Grade.
  - Ability to reset options to default values.
- Use native dialog instead of alert for Grade Summary.
- Message Preview is now significantly faster and does not slow down the rest of the page while loading.

### Fixed
- Fix all schedule modules (Free Block, Highlight Current Class, and Class Ending Time) not working with "today" button.
- Fix multiple class ending times appearing.
- Fix grades being hidden when using Grade Summary and Next Graded Course.

## 0.5.0 (2018-04-15)
### Added
- "Filter Website Main Search" module
- "Class Ending Time" module
- "Message Preview" module
- "Search Classes Menu" module
- "Next Graded Course" module
- Credits and special thanks

## 0.4.2 (2018-04-10)
### Fixed
- Correctly handle first time installation

## 0.4.1 (2018-04-07)
### Fixed
- Nonexistent module that was causing bundler to crash is removed

## 0.4.0 (2018-04-07)
### Added
- "Grade Summary" module
- "Free Block" module
- "Courses Search" module
- Options for enabling and disabling individual modules

### Changed
- Current class highlighter will update when day is changed
- The project is now open source and located [here](https://github.com/matankb/gann-oncampus-plus) with an MIT license

## 0.3.1-beta (2018-2-16)
### Added
- "Inline Change Status" module
- "Toggle Completed" module
- "Auto Close Detail Status" module
- "Archive All" module
- "Highlight Current Class" module

### Changed
- Use different method to run on modules, leading to a 50% increase in the speed at which modules appear on the page