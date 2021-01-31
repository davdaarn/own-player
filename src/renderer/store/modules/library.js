const {
  ipcRenderer
} = require('electron');

const state = {
  library: [],
  // 
  isSearching: false,
  isPlayingSong: false,
  songPaths: [],
};

const getters = {};

const actions = {
  async findSongs(context, baseDir) {
    context.commit('SET_SEARCHING', true);
    console.log('calling findSongs')
    console.log(baseDir);
    // fileWorker.postMessage('findSongs');
    ipcRenderer.invoke('FIND_SONGS', baseDir).then(x => {
      console.log(x);
    }).catch(err => {
      console.log(err);
    }).finally(x => {
      console.log(x);
    });
  },

  async loadLibrary(context) {
    ipcRenderer
      .invoke('LOAD_LIBRARY')
      .then(docs => {
        console.log(docs.length);
        context.commit('LOAD_LIBRARY', docs)
      })
      .catch(console.log)
      .finally(x => {});
  },
};

const mutations = {
  LOAD_LIBRARY(state, value) {
    state.library = value;
  },
  SET_SEARCHING(state, value) {
    state.isSearching = value;
  },
  SET_SONG_PATHS(state, value) {
    state.songPaths = value;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}