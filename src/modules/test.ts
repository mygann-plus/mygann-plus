import registerModule from '~/core/module';

export default registerModule('{2b6b661a-426f-4929-b289-7df4f9399918}', {
  name: 'lol',
  init() { console.log('init'); },
  main() { console.log('main'); },
  unload() { console.log('unload'); },
  affectsGlobalState: true,
  previewChanges: true,
  suboptions: {
    a: {
      type: 'boolean',
      name: 'aaa',
      defaultValue: true,
    },
  },
});
