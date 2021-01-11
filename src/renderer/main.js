import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import './assets/tailwind.css'

import {
  ipcRenderer
} from 'electron';
import DataStore from 'nedb';

Vue.config.productionTip = false

ipcRenderer
  .invoke('getPathToAppData')
  .then(res => {
    console.log(res);
    Vue.prototype.$db = {
      // playlists
      playlists: new DataStore({
        filename: `${res}\\playlister\\db\\playlists.db`,
        autoload: true
      }),
      // songs
      songs: new DataStore({
        filename: `${res}\\playlister\\db\\songs.db`,
        autoload: true
      }),
      // settings
    };
  })
  .catch(console.log)
  .finally(x => {

  });



new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
