## 0.6.0 (UNRELEASED)
### Added
- "Coming Up" module, which shows a preview of the next day's events in the schedule
- "Favorites" module
- "Day Schedule Button" module, which adds a button to return to the day view in the month & week schedule view
- "One Click Login" module, which restores the login page to before the summer of 2018 update with only one login button (as opposed to post-2018 version, which requires two button clicks: "next", then "login")
- Previous graded course button added to Next Graded Course module
- Hide ungraded courses feature in Filter Courses module
- Support for mobile menu in Search Classes Menu
- Three options for Filter Website in Main Search: collapse, move to bottom, and remove
- Maximum messages to preview and dissapear time in message preview is now configurable
- New buttons in Message Notifications 
  - Button to go to the first link found in the body of the message
  - Button to dismiss notification and mark message as read
- Added fix for native OnCampus bug where pressing escape in a compose message window causes unexpected quirks

### Changed
- Extension renamed to "Gann OnCampus+"
- Courses Search module renamed to "Courses Filter"
- Toggle Completed module tweaked visually and renamed to "Hide Completed"
- Options moved into desktop and mobile main dropdown
- Option dialog improvements
  - Popup box no longer appears after saving
  - Small look & feel tweaks, including sizing, colors, and toggles
  - More detailed descriptions for certain modules
  - Ability to reset options to default values
  - Most modules can be enabled and disabled without reloading the page
- Grade Summary improvements
  - Use native dialog instead of alert
  - Notify user if they have no graded classes
- Dialogs respond to escape key and are more consistent with native dialogs
- Message Preview renamed to "Message Notifications"
- Message Notifications improvements
  - It is now significantly faster and does not slow down the rest of the page while loading
  - Small look & feel tweaks to match native site theme and make buttons easier to locate
 

### Fixed
- Fix all schedule modules (Free Block, Highlight Current Class, and Class Ending Time) not working with "today" button
- Fix multiple class ending times appearing
- Fix grades being hidden when using Grade Summary and Next Graded Course
- Fix Inline Change Status not always appearing and flashing dropdown
- Fix Hide Completed causing background flickering and behaving inconsistently
- Fix "view more classes" being included in Search Classes Menu result
- Under the hood fixes and performance improvements

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