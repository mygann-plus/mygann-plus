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
    }
  }
}
```

### Bookmarklet Script
`javascript:fetch('https://oncampusplus-bookmarklet.surge.sh/dist/content-script.js').then(d=>d.text()).then(eval)`