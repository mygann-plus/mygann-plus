## Creating a module

1. Create a file or folder in src/modules
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
        "_comment_": "internal comment, not displayed to user"
    }]
}
```

**Only use remote disable in extreme cases!** If the bug is not critical, do not disable the module.

For example, Improved Status Dropdown stopped working with tasks. This was an appropriate time to use remote disable.

