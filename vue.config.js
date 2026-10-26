const { defineConfig } = require("@vue/cli-service");
const AutoImport = require("unplugin-auto-import/webpack").default;
const Components = require("unplugin-vue-components/webpack").default;
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
// const path = require("path");
module.exports = defineConfig({
  publicPath: "/up/",
  productionSourceMap: process.env.NODE_ENV === "production" ? false : true,
  transpileDependencies: true,
  lintOnSave: false,

  //add by hwt
  // productionSourceMap: true, // 生成 sourcemap（方便调试）

  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "~@/assets/styles/base.scss" as *;`
      }
    }
  },
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false"
      });
      return definitions;
    });
  },
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
    // resolve: {
    //   symlinks: false,
    //   alias: {
    //     vue: path.resolve("./node_modules/vue")
    //   }
    // }

    //add by hwt
    // optimization: {
    //   minimize: false, // 完全禁用压缩（默认是 true）
    // },
  },
  devServer: {
    client: {
      overlay: false
    },
    open: true,
    proxy: {
      // "/FJRH.Embedded": {
      //   target: "http://192.168.0.55:49527",
      //   // target: "http://10.10.40.103:49527",
      //   changeOrign: true,
      //   https: false
      // },
      "/upgrade": {
        target: "http://192.168.0.125",
        changeOrigin: true
      }
    }
  }
});
