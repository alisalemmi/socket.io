module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/scss/_var.scss"'
      }
    }
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
};
