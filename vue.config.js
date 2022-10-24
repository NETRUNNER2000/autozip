const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: "Autozip",
        appId: 'autozip.com',
        win: {
            "target": [
                "nsis"
            ],
          icon: 'public/svg.png',
        },
        "nsis": {
            "installerIcon": "public/favicon.ico",
            "uninstallerIcon": "public/favicon.ico",
            "uninstallDisplayName": "CPU Monitor",
            "oneClick": false,
            "allowToChangeInstallationDirectory": true
        }
      },

      nodeIntegration: true,
      preload: 'src/preload.js',
    }
  }
})
