module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/_var.scss";
          @import "@/scss/_utility.scss";
        `
      }
    }
  },
  devServer: {
    proxy: {
      '^/socket.io': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
};
