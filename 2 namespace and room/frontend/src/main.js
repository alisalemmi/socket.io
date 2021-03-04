import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import socket from './socket';
import VueSocketIOExt from 'vue-socket.io-extended';

Vue.use(VueSocketIOExt, socket, {
  store,
  actionPrefix: 'action',
  mutationPrefix: 'mutate',
  eventToMutationTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`,
  eventToActionTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
