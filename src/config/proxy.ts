console.log('process', import.meta.env)
export default {
  proxy: {
    url: import.meta.env.DEV ? 'https://monad-api.blockvision.org' : 'https://proxy.4165306.xyz'
  }
}