# Codebase Notes

#### Directory Structure

* `utils` is used for generic utilities shared across modules with different use cases.

* `shared` is used for specific functions shared across modules with the same use case.

#### Suboptions Object Format
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

### Bookmarklet Script
`javascript:fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js').then(d=>d.text()).then(eval)`

## Remote Disable Format

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

### Typescript Conventions

- Always use `as` to typecast, since `<>` notation isn't allowed in `.tsx` files
- Use `any` type for data returned from OnCampus API (for the time being, maybe later add types)