## 1.20.3
### Changed
- Nav highlighting in non-enhanced theme
- Dynamic Title to "X minutes left" from "X minutes remaining"

## 1.20.2
### Changed
- Moved Zoom Links higher in schedule
- Enable Zoom links by selecting "Always show Zoom links" under the "Zoom Links" module

## 1.20.1
### Fixed
- Bad color styling in enhanced theme

## 1.20.0
### Added
- Enhanced theme option to color more of the webpage
- Improved look for schedule buttons
- Module to hide letter grade options in progress page
 
### Fixed
- Improper highlighting on free blocks with zoom links
- Free block mistakes on Friday schedule (even free blocks are confused how the Friday schedule works)
- Undefined dynamic title after school day
 
### Changed
- Theme styles in nav bars
- Avatar image roster loading to improve performance
- Name quiz button styling (no button left behind)
- Theme module to allow alpha channel (we value transparency)

## 1.19.0
### Added
- Dynamic Title module that displays time remaining in class in tab title (to enable it go to MyGann+ Options)

### Changed
- Removed console log in about/index.tsx
- Your name in top nav to vertical alignment
- Name Quiz no longer uses custom avatars by default. Who looks like a loading sign?
- Name Quiz can now be hidden by clicking the button again

### Fixed
- Zoom links stopped working after a free block sometimes

## 1.18.0
### Added
- Re-added Zoom Links
- Zoom Links module function to search class pages for links and automatically add them to schedule
- Control dropdown with MyGann+ Avatars link
- Description for the Favorites module

### Changed
- MyGann+ control placement; Moved MyGann+ controls to separate dropdown in top nav
 
### Removed
- "Looking for target" message in directory search. Brusher games has ended, keeping it would be creepy... (Congrats Daniel!)

## 1.17.8
### Fixed
- Auto Search Directory now works even when your screen is too small to use properly

## 1.17.7
### Fixed
- Avatars display bug

## 1.17.6
### Added
- "Looking for your target?" in directory search bar

### Fixed
- Auto search directory bug; searching failed with contacts

## 1.17.5
### Fixed
- Free block. Again.

## 1.17.4
### Changes
- Nothing changed, we just like to update

## 1.17.3
### Changed
- All changelogs since confetti update displays

### Fixed
- Messages now show custom avatars

## 1.17.2
### Fixed
- Fixed free blocks again because they needed to be fixed again

### Removed
- Removed Zoom Links. Go to class!
- Removed Independent Study option in Free Block because we value teamwork

## 1.17.1 
### Fixed
- Fixed free blocks, you guys can chill now
- Removed the servery menu because it hasn't worked since the Obama Administration

## 1.17.0
### Added
- Added confetti to Improved Status Dropdown

### Changed
- Removed opt-out for notification dot because we control you
- Improved Improved Status Dropdown because Improved Status Dropdown was not improved enough

### Fixed
- Fixed notification dot

## 1.16.0
### Added
- "Smart Schedule" module, which sets schedule date to next date with classes
- "Directory Quick Search" module, which returns results as you type for quicker searching

## Changed
- Updated teacher offices
- Added test extension
- Fixed webpack
- Removed unnecessary lines in Avatars code

## Fixed
- Fixed improper Avatars loading on module toggle

## 1.15.0
### Added
- "Avatars" module, which allows user to upload a new profile picture (to be seen by other MyGann+ users)

### Changed
- Updates occur instantly by fetching served content script instead of waiting for the chrome web store to update

## 1.14.0
### Added
- "Hide Assignment Time" module
- Add cancel button to task detail edit dialog

## 1.13.2
### Changed
- Use distinct icon in Mark All as Read

### Fixed
- Fix Improved Status Dropdown not editing tasks
- Fix Schedule Arrow Navigation interfering with editing Zoom Links
- Fix ungraded assignments displaying null in Preview Assignment Grade
- Fix Assignment Checkpoints editor not closing on save if nothing changed

## 1.13.1
## Fixed
- Fix Zoom Links not working for custom personal IDs

## 1.13.0
### Added
- Zoom Links module

### Fixed
- Fix Free Blocks for quarentine schedule
- Fix schedule modules (highlight current class, free blocks, etc) sometimes not appearing

## 1.12.1
### Added
- April Fools 2020

## 1.12.0
### Added
- "Subtasks" module, which enables adding subtasks to larger assignments
- "Default Assignment Sort" module, which adds option to set how the order of assignments should be sorted by default
- "Fix Assignment Center Date" module, which removes extra zero in assignment center date
- "Hide Community Service Assignment" module
- Add button to clear individual grade notifications

### Changed
- Renamed Coming Up to "Tomorrows Events"
- Bold the button of the selected course in Courses Filter
- Self-set nickname is now used in Name Quiz
- Enabled Name Quiz on activity and advisory pages
- Hide Nonacademic Classes now removes empty space in Classes Menu

### Fixed
- Fix the following modules not unloading correctly when disabled:
  - Hide Nonacademic Classes
  - Teacher Offices
  - Semester Switcher
- Fix Graded Notification and Progress Assignment Details displaying HTML
- Fix Progress Assignment Details deleting the next assignment if the selected assignment has no details
- Fix Next Graded Course not working during second semester

### Removed
- Removed dropdown from Courses Filter, since its only item was nonfunctional 

## 1.11.0
### Added
- Create "Automatically Collapse Progress Boxes" module

### Changed
- Hide Nonacademic Classes shows Community Service on progress page
- Support rubrics in Calculate Grade Percentage

### Fixed
- Fix internal storage not working the first time it's used by a module
- Fix task details not working if the URL ends with a slash
- Fix Hide Nonacademic Classes not working on progress if progress is navigated to without reloading
- Fix Name Quiz not working on class pages
- Fix Archive All button appearing twice after running archive all or mark all as read
- Fix Grade Notifications and Free Block exceptions not working on computers with non-US date formatting

## 1.10.1
### Changed
- Show 1st Semester button is hidden during first semester

### Fixed
- Fix the following progress modules not working after semester is switched:
  - Calculate Grade Percentage
  - Collapse Assignment Sections
  - Full Year Assignments
  - Progress Assignment Description
  - Hide Nonacademic Classes
- Support letter grades in Grade Notifications and Preview Assignment Grade
- Fix the dropdown menu in Class Email being open by default
- Fix Name Quiz not working on group pages

## 1.10.0
### Added
- Button to switch sports seasons in Semester & Season Switcher

### Changed
- Renamed "Semester Switcher" to "Semester & Season Switcher"
- Hid Fix Semester Switch Bug in options

### Fixed
- Fix Progress Assignment Details not working with Hebrew assignment titles
- Fix letter grades breaking Calculate Grade Percentage

### Removed
- Fix Task Class removed, because MyGann fixed this bug natively

## 1.9.2
### Changed
- Display help message for certain teacher offices

## 1.9.1
### Changed
- Moved teacher offices and nonacademic classes to external server, which enables them to be quickly modified without a new release.
- Display if a module is remote disabled in options

## 1.9.0
### Added
- "Auto Focus Site Search" module, which autofocuses the site searchbar when opened
- "Schedule Arrow Navigation" module, which enabled using the arrow keys to switch days in the schedule
- "Semester Switcher" module, which adds a button to quickly switch semesters
- Option to Hide Completed to stay enabled through page reloads
- Internal system to quickly remotely disable modules if they break

### Changed
- Options will warn if the window closes with unsaved options
- Name Quiz will not display students without photos or the current user
- Name Quiz will also accept the regular name of a student if a nickname is set
- Theme will warn if the custom font exists on Google Fonts

## Fixed
- Fix Name Quiz only displaying the first twenty students in the roster, due to a change in MyGann
- Fix Courses Filter bar positioned incorrectly, due to a change in MyGann

## 1.8.1
### Fixed
- Fix Hide forms displaying an incorrect amount of forms in banner

## 1.8.0
### Added
- Progress Assignment Description module, which displays the description of graded assignments in progress
- Servery Menu module, which displays the daily servery menu in schedule

### Fixed
- Fix internal "fix.fixTaskClass" module incorrectly being displayed in options

## 1.7.3
### Fixed
- Fix previously noncritical error which breaks entire extension in Chrome 74

## 1.7.2
### Fixed
- Fix Grade Notifications displaying unpublished grades
- Fix assignment titles occasionally containing special characters
- Fix Free Block displaying "12:00 AM" as the start time for the block following lunches

## 1.7.1
### Added
- "Fix Task Class" module, which fixes native bug in which the course a task was assigned to was not displayed

## 1.7.0
### Added
- "Theme" module
- "Full Year Assignments" module, which displays grades from the entire year in progress

### Changed
- Breakfast added by default to Hide Nonacademic Classes
- Behavior tweak in Hide Completed: If assignments are marked as completed while the button is enabled, reclicking the button will hide those assignments (instead of turning it off)

### Removed
- Hide Nonacademic Classes keywords suboption: it was unused and made updating the keyword list impossible.

## 1.6.1
### Added
- Added suboption in My Day Shortcut to hide My Day menu

### Fixed
- Fix Hide Completed button being permanently disabled after single use
- Fix Chrome incorrectly autocompleting username in options dialog search
- Fix multiple misspellings of "tomorrow".
- Fix Next Graded Course not working during second semester

## 1.6.0
### Added
- "Fix Semester Switch Bug" module, which fixes native bug in which assignments are temporarily duplicated during the semester switch

## 1.5.0
### Added
- "Hide Forms" module, for permanently hiding individual forms
- "Task Details" module, which adds descriptions to "My Tasks"
- "My Day Shortcut" module, for going directly to a My Day page by clicking on the My Day header
- "Roster Name Quiz" module, which adds a quiz to help learn students' names
- "Block Length" module, which shows the length of class blocks in the schedule
- "Class Email" module, which adds a button to quickly send an email to members of a class
- Searchbar in options dialog

### Changed
- Improved Change Status supports custom tasks
- Teacher Office numbers are now more comprehensive
- The block letter is displayed in Free Blocks
- Class Ending Time supports the teacher schedule page

### Fixed
- Fix assignment names in the Grade Notification new graded assignments list displaying incorrect characters
- Fix Grade Notification badge flickering after being cleared

## 1.4.1
### Fixed
- Fix Grade Notification Dialog not opening

## 1.4.0
### Added
- "Calculate Grade Percentage" module
- "Collapse Assignment Sections" module
- "Due Soon" module
- "Grade Notifications" module

### Changed
- Only show Message Notifications for messages sent after install date

### Fixed
- Fix Teacher Offices not working for teachers without emails
- Fix Message Notifications appearing under the directory sidebar
- Fix Message Notifications controls incorrectly positioned in short messages
- Fix Class Ending Time reappearing after being disabled in edge case

## 1.3.4
### Fixed
- Fix Free Blocks showing blocks at noon as 0:00
- Fix Next Graded course buttons not staying focused when tabbing through courses

## 1.3.3
### Fixed
- Fix install notification not disappearing

## 1.3.2
### Changed
- Update notification disappears when the flyout appears, instead of when the flyout hides

### Fixed
- Fix Free Block hour overflow bug
- Fix Free Block inserting multiple blocks
- Fix install notification not supporting mobile layout
- Fix Next Graded Course buttons dissapearing in edge case

## 1.3.1
### Fixed
- Fix installation issue

## 1.3.0
### Added
- Create Message Conversation Archive module
- Hide Non-Academic Classes will hide classes in progress page

## Changed
- Hide Classes in Menu renamed to "Hide Non-Academic Classes" 
- "Hide Completed" renamed to "Hide Completed Button"

## Fixed
- Fix incorrect release notes showing in About if extension not updated
- Fix Next Graded Course not working with new cumulative grade calculation policy

## Removed
- Grade Summary module removed: it is no longer useful because MyGann does not calculate cumulative grades anymore
- Hide Tasks After Due module removed: MyGann implemented this functionality natively

## 1.2.0
### Added
- "Teacher Offices" module, which shows teacher and faculty office numbers in the directory
- "Mark All as Read" module
- Inline bug reports

### Fixed
- Fix Free Block not handling daylight savings correctly

## 1.1.2 (2018-10-10)
### Changed
- Automatically add the version to bug reports

### Fixed
- Fix inaccuracies in Free Block calculations

## 1.1.1 (2018-10-10)
### Fixed
- Fix installation issue caused by missing icon

## 1.1.0 (2018-10-09)
### Added
- Hide button to Grade Preview labels

### Changed
- When one message notification is clicked, the other message notifications now stay visible.

### Fixed
- Fix Message Notification incorrectly displaying multiple new lines
- Fix Free Block issues:
  - Free Blocks inconsistently appearing
  - Free Blocks always showing B block at the end of the day
  - Free Blocks not appearing at the end of day on Friday
  - Free Blocks start time incorrectly handling times over an hour
- Fix Class Ending Time incorrectly handling times over an hour

## 1.0.0 (2018-09-28)
### Added
- "Hide Classes in Menu" module, which hides non-academic "classes" in the classes menu.
- Highlight Current Class and Class Ending Time will refresh every minute
- Button to preview assignment grade for individual assignments
- Extension icon
- "Don't show again" button for update notification

### Changed
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

## 0.6.0 (2018-09-12)
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
