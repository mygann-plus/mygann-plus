## Creating a module

1. Create a file or folder in `src/modules`
    * If the module will include CSS, create a folder called `module-name`, with an `index.ts` and `style.css` file
    * Otherwise, create a file called `module-name.ts`
2. Register the module in `MODULE-MAP` 
    * In `core/module-map.ts`, 
3. Set up module
    * This is the basic template for a module:
```typescript
import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

async function moduleNameMain(opts: void, unloaderContext: UnloaderContext) {}

export default registerModule('{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}', {
    name: 'User-friendly module name',
    description: 'Longer, user-friendly module description',
    main: moduleNamenMain,
}); 
```

## Shared vs Utils
`shared` is for code that is specific to one page on MyGann. `utils` is for all other utilities and shared code. In general, the rule of thumb is if the code is shared among a specific *page*, or a specific *functionality*. 

## Common Utilities

### Wait for Load

`waitForLoad` takes a function and returns a Promise, which resolves when the function returns true. This is used to wait for a specific element to appear in the DOM. The function will be tested every time the DOM changes.

### JSX/Create Element

MyGann+ uses `JSX`. Read more about JSX [here](https://reactjs.org/docs/introducing-jsx.html). 

Caveats of JSX using typescript:

* All event listeners must be of form ```(e: any) => { /* code */ }```

## Remote Disable

If a module is critically broken, you can instantly disable the module for everyone. 

```json
{
    "$schemaVersion": 1,
    "disabled": [{
        "guid": "{guid of broken module}",
        "extensionVersion": "broken version, in semver",
        "message": "(optional) message to display to user",
        "_comment": "internal comment, not displayed to user"
    }]
}
```

**Only use remote disable in extreme cases!** If the bug is not critical, do not disable the module.

For example, recently the Improved Status Dropdown made it impossible to edit tasks. This was an appropriate time to use remote disable.

## Releasing a New Version

1. Increment the version
    * `manifest.json` "version" and "version_name"
    * `test/manifest.json` "version" and "version_name"
    * `package.json` "version"
    * `utils/manifest.ts` "version_name"
    
    Format of versions: `x.y.z`
    * For releases that only fix bugs, increment `z`
    * For releases that add features, increment `y`
    * For releases that significantly change the way MyGann+ works, increment `x` (this has only happened once, when MyGann+ went from beta to stable. This should be reserved for major overhauls).
    * If you increment one, the rest below it go to 0 (increment y, z goes to 0)

2. Update `changelog.md` with new features, changes, or fixes
3. Update the "Known Issues" page on the GitHub wiki, if applicable.
4. Commit and push to GitHub, then create a new GitHub release. The release tag should be vx.y.z (e.g., v1.6.9) and the release name should be "Version x.y.z.". The description of the release should be what was added to the changelog.
5. Run `npm run build`.
6. Run `npm run deploy-bookmarklet`
7. Copy the `dist` folder, the `assets` folder, and the `manifest.json`.into a new folder. Install that folder in Chrome to make sure it works.
8. Upload the folder to the Chrome Web Store and publish.

## General Uploading Commands
>! Some of this may no longer be in use once we migrate to manifest v3

- To upload the current code:
  1. `npm run build`
  2. `npm run deploy-surge`

- To upload the `/data` folder (will be more important following the change to v3)
  1. `npm run push-in-cd-data`

## Bookmarklet

The bookmarklet allows non-Chrome users to use MyGann+. To create a MyGann+ bookmarklet, use the following code. 

`javascript:fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js').then(d=>d.text()).then(eval)`


## Suboptions Object Format
```javascript
{
  myOption: { // key
    name: 'My Option', // User-friendly option name
    type: '', // string, one of [boolean, enum, number, string]
    defaultValue: '', // default value (for enum, string key of default value)
    enumValues: { // object of values in enum
      doOneThing: 'Do One Thing', // Internal key : User-friendly value name
    },
    dependent: 'myOtherOption' // (optional) only show if myOtherOption is enabled
  }
}
```

## Typescript Conventions

- Always use `as` to typecast, since `<>` notation isn't allowed in `.tsx` files
- Use `any` type for data returned from OnCampus API (for the time being, maybe later add types)
