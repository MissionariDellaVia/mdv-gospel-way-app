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
      lang: "it",
      categories: ["lifestyle", "education", "books"]
    },
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('^http://www.missionaridellavia.net'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 1 day
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        }
      ]
    }
  }
})
