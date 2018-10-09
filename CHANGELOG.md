## 1.1.0
## Added
- Hide button to Grade Preview labels

## Changed
- When one message notification is clicked, the other message notifications now stay visible.

### Fixed
- Fix Message Notification incorrectly displaying multiple new lines
- Fix Free Block issues:
  - Free Blocks inconsistently appearing
  - Free Blocks always showing B block at the end of the day
  - Free Blocks not appearing at the end of day on Friday
  - Free Blocks start time incorrectly handling times over an hour
- Fix Class Ending Time incorrectly handling times over an hour

## 1.0.0
## Added
- "Hide Classes in Menu" module, which hides non-academic "classes" in the classes menu.
- Highlight Current Class and Class Ending Time will refresh every minute
- Button to preview assignment grade for individual assignments
- Extension icon
- "Don't show again" button for update notification

## Changed
- Free A and B blocks correctly start at 3:55
- Show Grades button is disabled if there are no graded assignments 
- Next Graded Course buttons have text instead of icons
- Hide Preview Assignment Grades button by default
- Disable Coming Up and Favorites by default

### Fixed
- Fix Next Graded Course not updating when next/previous course button pressed
- Fix Highlight Current Class and Class Ending Time inconsistently appearing
- Fix Message Notification incorrectly displaying new lines
- Fix Improved Status Dropdown not working with overdue assignments
- Fix Improved Status Dropdown inconsistently changing status

## 0.6.0
### Added
- "Coming Up" module, which shows a preview of the next day's events in the schedule
- "Favorites" module
- "Day Schedule Button" module, which adds a button to return to the day view in the month & week schedule view
- "One Click Login" module, which restores the login page to before the summer of 2018 update with only one login button (as opposed to post-2018 version, which requires two button clicks: "next", then "login")
- "Hide Tasks After Due" module, which hides "My Tasks" after their due date, or based on the selected date(s) in the assignment center
- "Message Links" module, which makes links in messages clickable
- "Mark As Read" module for messages
- Previous graded course button added to Next Graded Course module
- Hide ungraded courses feature in Filter Courses module
- Support for mobile menu in Search Classes Menu
- About dialog
- Support for mobile or non-Chrome browsers through bookmarklet
- Notification when extension updates
- Welcome message when extension first installs
- Three options for Filter Website in Main Search: collapse, move to bottom, and remove
- Maximum messages to preview and dissapear time in message preview is now configurable
- New buttons in Message Notifications 
  - Button to go to the first link found in the body of the message
  - Button to dismiss notification and mark message as read
- Added fixes for native MyGann bugs:
  - Fix for pressing escape in a compose message window causing unexpected quirks
  - Fix for menu dividers (including in the directories menu and main dropdown) not always being visible
  - Fix for Archived Inbox page highlighting "Official Notes" instead of "Messages" in the top navigation bar

### Changed
- Extension renamed to "MyGann+"
  - Repository moved to github.com/matankb/mygann-plus
- Courses Search module renamed to "Courses Filter"
- Inline Assignment Grade module added to mobile menu and renamed to "Preview Assignment Grade"
- Toggle Completed module tweaked visually, added to mobile menu, and renamed to "Hide Completed"
- Options moved into desktop and mobile main dropdown
- Free Block will show free A and B blocks
- Option dialog improvements
  - Popup box no longer appears after saving
  - Small look & feel tweaks, including sizing, colors, and toggles
  - More detailed descriptions for certain modules
  - Ability to reset options to default values
  - Most modules can be enabled and disabled without reloading the page
  - Option changes are applied across all open tabs
- Grade Summary improvements
  - Use native dialog instead of popup
  - Notify user if they have no graded classes
- Dialogs are more consistent with native dialogs
  - Respond to escape key
  - Handle small window sizes
  - Small look & feel tweaks to match native appearence
- Message Preview renamed to "Message Notifications"
- Message Notifications improvements
  - It is now significantly faster and does not slow down the rest of the page while loading
  - Small look & feel tweaks to match native site theme and make buttons easier to locate
- Search Classes Menu and Courses Filter will search all words in course name, not just first, and ignore punctuation
- Search Classes Menu tweaks to make it appear more native
- Archive all is now significantly faster and does not slow down the rest of the page
- Class Ending time will update time every minute 
 
### Fixed
- Fix all schedule modules (Free Block, Highlight Current Class, and Class Ending Time) not working with "today" button
- Fix multiple class ending times appearing
- Fix grades being hidden when using Grade Summary and Next Graded Course
- Fix Inline Change Status not always appearing and flashing dropdown
- Fix Hide Completed causing background flickering and behaving inconsistently
- Fix "view more classes" being included in Search Classes Menu result
- Fix Courses Filter bar and Grade Summary button disappearing when native courses bar buttons are clicked
- Fix Search Classes Menu occasionally going to class page when menu is closed and enter is pressed
- Fix Archive All button duplicating when opening compose and message threads
- Fix Free Block incorrectly showing when two blocks overlap
- Fix Highlight Current Class not highlighting Free Blocks
- Under the hood fixes and performance improvements

### Known Issues
- Due to internal changes, options will be reset when upgrading to this version.

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