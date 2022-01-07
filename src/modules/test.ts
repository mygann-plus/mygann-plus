import registerModule from '~/core/module';

export default registerModule('{2b6b661a-426f-4929-b289-7df4f9399918}', {
  name: 'lol',
  main() { console.log('main'); },
  unload() { console.log('unload'); },
  affectsGlobalState: true,
  suboptions: {
    a: {
      type: 'boolean',
      name: 'a',
      defaultValue: true,
    },
  },
});
