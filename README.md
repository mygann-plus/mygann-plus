# Codebase Notes

#### Directory Structure

* `utils` is used for generic utilities shared across modules with different use cases.

* `shared` is used for specific functions shared across modules with the same use case.

#### Options Object Format
```javascript
{
  myOption: { // key
    name: 'My Option', // User-friendly option name
    description: '', // User-friendly option description
    type: '', // string, one of [boolean, enum, number, string]
    defaultValue: '', // default value (for enum, string key of default value)
    enumValues: [{ // array of values in enum
      name: 'Do One Thing', // User-friendly value name
      key: 'doOneThing',
    }]
}
}
```