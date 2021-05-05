import Vue from 'vue';
import { Plugin } from '@nuxt/types';
import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import { initSocket } from '@/util/initialize/socket.io';

const socket = io();

const transformName = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

const injectSocket: Plugin = ({ store }) => {
  initSocket(socket);

  Vue.use(VueSocketIOExt, socket, {
    store,
    actionPrefix: 'on',
    mutationPrefix: 'on',
    eventToMutationTransformer: transformName,
    eventToActionTransformer: transformName
  });
};

export default injectSocket;
