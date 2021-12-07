import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import VueSocketIO from 'vue-3-socket.io';
import config from '../package.json';

createApp(App).use(new VueSocketIO({
	debug: true,
	connection: `${window.location.protocol}//${window.location.hostname}:${config.socketPort}`,
	options: {
		autoConnect: false,
	},
	vuex: {
		store,
		actionPrefix: 'SOCKET_',
		mutationPrefix: 'SOCKET_'
	},
})).use(ElementPlus).use(store).use(router).mount('#app')
