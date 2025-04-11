const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
      ? '/'
      : '/mdv-gospel-way-app/',
  transpileDependencies: true,
  pwa: {
    name: 'La Via del Vangelo',
    themeColor: '#6E4F3A',
    msTileColor: '#281D02FF',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      background_color: "#6E4F3A",
      description: "L'app ufficiale de La Via del Vangelo - Missionari Della Via",
      display: "standalone",
      orientation: "portrait",
      lang: "it"
    },
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
      swDest: 'service-worker.js',
    }
  }
})
