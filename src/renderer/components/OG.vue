<template>
  <div class="flex flex-col h-full text-gray-300">
    <div class="h-20 flex-grow pl-2">
      <div class="h-full overflow-auto">
        <div class="h-24"></div>
        <!-- put router here... -->
        <button outlined v-on:click="playTest">Play</button>
        <button outlined v-on:click="stopTest">Stop</button>
        <button outlined v-on:click="directoryUp">Back</button>
        <button outlined v-on:click="logDir">Directory</button>
        <div
          class="w-1/3 h-1/3"
          @dragenter.prevent
          @dragover.prevent
          v-on:drop.prevent="testWalk"
        >
          Drop Songs here
        </div>
        <p id="p1" draggable="true">This element is draggable.</p>
        <div>
          <p>{{ pathCount }} songs discovered</p>
          <p>Processing song # {{ songIndex }}</p>
          <p>
            New songs added: {{ songsAdded }}, Songs already in library:
            {{ existingSongs }}
          </p>
        </div>
        <!-- <button outlined v-on:click="testWalk">Test Walk</button> -->
        <button outlined v-on:click="$store.dispatch('library/findSongs')">
          Test Worker
        </button>
        <button outlined v-on:click="test3">Test 3</button>
        <img v-if="dataURL" :src="dataURL" alt="Item Artwork" />
        <img v-if="dataURL" :src="dataURL" alt="Item Artwork" />
        <img v-if="dataURL" :src="dataURL" alt="Item Artwork" />
        <div>
          <span>Directory: </span>
          <span v-if="currentDir.length > 0" @click="toRoot">
            <span>Home</span>
          </span>
          <span v-for="(d, i) in currentDir" :key="d" v-on:click="getPath(i)">
            <span>
              <span class="mdi mdi-chevron-right"></span>
            </span>
            <span>{{ d }}</span>
          </span>
        </div>
        <div
          v-for="(d, i) in directoryItems"
          :key="i"
          v-on:click="handleOnDirectoryItemClick(d, i)"
          style="cursor: pointer"
          draggable="true"
          v-bind:id="d.path"
          v-on:dragstart="updateTarget"
        >
          <div class="mdi" :class="d.icon"></div>
          {{ d.path }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const fs = require('fs');
const path = require('path');
const os = require('os');
// const ipc = require('electron').ipcRenderer;
const { ipcRenderer } = require('electron');
const mm = require('music-metadata');
const util = require('util');
import { DirectoryItem, SongContainer } from '../types';
const NodeID3Promise = require('node-id3').Promise;
// import { Howler, Howl } from 'howler';
import { Howler, Howl } from '../libs/howler';
import { Song } from '../types';

import { mapState, mapGetters } from 'vuex';

// const sharp = require('sharp');

// const drivelist = require('drivelist');

export default {
  data() {
    return {
      homedir: '',
      directoryItems: [],
      isLoading: false,
      currentDir: [],
      song: null,
      dataURL: null,
      pathCount: 0,
      songIndex: 0,
      songsAdded: 0,
      existingSongs: 0
    };
  },
  computed: {
    progress: function() {
      return (this.songIndex / this.pathCount) * 100;
    },
    isSearching() {
      return this.$store.state.isSearching;
    }
  },
  methods: {
    logDir() {
      // console.log(this.currentDir);
      this.currentDir = ['C:/', 'Users', 'davda', 'OneDrive', 'Music'];
      const fullPath = this.currentDir.join('/').replace('//', '/');
      this.updateDirectoryItems(fullPath);
    },
    renderImage(data, format) {
      let blob = new Blob([data.buffer], {
        type: metadata.image.mime
      });
      let urlCreator = window.URL || window.webkitURL;
      return urlCreator.createObjectURL(blob);
    },
    // used for drag and drop
    updateTarget(e) {
      console.log(e);
      e.dataTransfer.setData('Text', e.target.id);
    },
    // using
    testWalk(e) {
      // Todo: handle drag from computer or from app
      // let data = e.dataTransfer.getData('Text');
      // let fullPath = '';
      // console.log(this.currentDir);
      // if (this.currentDir.length > 0) {
      //   fullPath = this.currentDir.join('/').replace('//', '/') + '/';
      // }
      // fullPath += data;
      // console.log(fullPath);
      // ipcRenderer
      //   .invoke('findSongs', e)
      //   .then()
      //   .catch()
      //   .finally();

      let paths = [];
      e.dataTransfer.files.forEach(file => {
        paths.push(file.path);
      });

      this.$store.dispatch('library/findSongs', paths).then(x => {
        console.log(x);
      });
    },
    //
    test(e) {
      const paths = [];
      e.dataTransfer.files.forEach(element => {
        // console.log(element);
        if (fs.lstatSync(element.path).isDirectory()) {
          // this.searchInDirectory(
          //   fs.readdirSync(element.path, { withFileTypes: true })
          // );
          let paths = fs.readdirSync(element.path, { withFileTypes: true });
          console.log(paths.length);
          paths.forEach((p, i) => {
            console.log(i, p);
            // NodeID3Promise.read(`${element.path}/${p.name}`).then(metadata => {
            //   console.log(metadata);
            // });

            /////////
            NodeID3Promise.read(`${element.path}/${p.name}`).then(metadata => {
              // console.log(metadata);
              const item = new Song({
                album: metadata.album,
                artist: metadata.artist,
                format: element.type,
                genre: metadata.genre,
                path: element.path,
                length: metadata.length,
                rating: metadata.popularimeter
                  ? metadata.popularimeter.rating
                  : 1,
                // if metadata is bad, use file name minus the extension
                title: metadata.title
                  ? metadata.title
                  : element.name.split('.mp3')[0],
                trackNumber: metadata.trackNumber,
                year: metadata.year
              });

              console.log(item);

              this.$db.songs.find(
                { title: item.title, album: item.album, artist: item.artist },
                (err, docs) => {
                  if (err) {
                    console.log(err);
                  } else if (docs.length < 1) {
                    console.log('song does not exist');
                    this.$db.songs.insert(item, (err, newDoc) => {
                      if (err) {
                      } else {
                        console.log(`${item.title} added`);
                      }
                    });
                  } else {
                    console.log('file exists');
                  }
                }
              );
            });
            /////////
          });
        } else if (
          fs.lstatSync(element.path).isFile() &&
          RegExp('[.]mp3$').test(element.path)
        ) {
          NodeID3Promise.read(element.path).then(metadata => {
            // console.log(metadata);
            const item = new Song({
              album: metadata.album,
              artist: metadata.artist,
              format: element.type,
              genre: metadata.genre,
              path: element.path,
              rating: metadata.popularimeter
                ? metadata.popularimeter.rating
                : 1,
              // if metadata is bad, use file name minus the extension
              title: metadata.title
                ? metadata.title
                : element.name.split('.mp3')[0],
              year: metadata.year
            });

            this.$db.songs.find(
              { title: item.title, album: item.album, artist: item.artist },
              (err, docs) => {
                if (err) {
                } else if (docs.length < 1) {
                  this.$db.songs.insert(item, (err, newDoc) => {
                    if (err) {
                    } else {
                      console.log(`${item.title} added`);
                    }
                  });
                } else {
                  console.log('file exists');
                }
              }
            );
          });
        } else {
        }
      });
    },
    test2() {
      console.log(process.platform);
      if (process.platform === 'win32') {
        const spawn = require('child_process').spawn;
        const child = spawn('powershell.exe', [
          // `Write-Host "Drive information for $env:ComputerName"
          `Get-WmiObject -Class Win32_LogicalDisk |
        Where-Object {$_.DriveType -ne 5} |
        Sort-Object -Property Name | 
        Select-Object Name, VolumeName, FileSystem, Description, VolumeDirty, MediaType, DeviceID, DriveType, \`
          @{"Label"="DiskSize(GB)";"Expression"={"{0:N}" -f ($_.Size/1GB) -as [float]}}, \`
          @{"Label"="FreeSpace(GB)";"Expression"={"{0:N}" -f ($_.FreeSpace/1GB) -as [float]}}, \`
          @{"Label"="%Free";"Expression"={"{0:N}" -f ($_.FreeSpace/$_.Size*100) -as [float]}} |
        ConvertTo-Json`
        ]);

        child.stdout.on('data', function(data) {
          if (data) {
            let dataArray = JSON.parse(data.toString());
            console.log(dataArray);
            // win.webContents.send('test', dataArray);
          }
        });
        child.stderr.on('data', function(data) {
          // console.log("Powershell Errors: " + data);
        });
        child.on('exit', function() {
          console.log('Powershell Script finished');
        });
        child.stdin.end(); //end input
      }
    },
    test3() {
      console.log(this.$db);
      this.$db.songs.find({}, (err, docs) => {
        console.log(err, docs);
      });
    },
    handleOnDirectoryItemClick(item, index) {
      if (item.type !== 'file') {
        this.directoryDown(item);
      } else {
        console.log(item);
        this.playNewSong(item.path);
      }
    },
    async playNewSong(path) {
      // console.log(path);
      const fullPath =
        this.currentDir.join('/').replace('//', '/') + `/${path}`;
      // console.log(fullPath);
      if (this.song) this.song.stop();
      this.song = await new Howl({
        src: [`safe-file-protocol://${fullPath}`],
        volume: 0.1,
        preload: true
      });

      // mm.parseFile(`safe-file-protocol://${fullPath}`)
      //   .then(metadata => {
      //     console.log(
      //       util.inspect(metadata, { showHidden: false, depth: null })
      //     );
      //   })
      //   .catch(err => {
      //     console.error(err.message);
      //   });

      NodeID3Promise.read(fullPath).then(metadata => {
        if (metadata.image) {
          let blob = new Blob([metadata.image.imageBuffer], {
            type: metadata.image.mime
          });
          let urlCreator = window.URL || window.webkitURL;
          let imageUrl = urlCreator.createObjectURL(blob);
          console.log(imageUrl);
          this.dataURL = imageUrl;
        }
      });
    },
    async playTest() {
      if (this.song) this.song.play();
    },
    async stopTest() {
      if (this.song) this.song.stop();
    },
    async getPath(currentDirIndex) {
      this.currentDir = this.currentDir.slice(0, currentDirIndex + 1);
      const fullPath = this.currentDir.join('/').replace('//', '/');
      console.log(fullPath);
      this.updateDirectoryItems(fullPath);
    },
    async updateDirectoryItems(fullPath) {
      this.directoryItems = [];
      let paths = fs.readdirSync(fullPath, { withFileTypes: true }); // returns array of dirnet
      // console.log(paths);
      paths.forEach(p => {
        // console.log(p);
        try {
          if (p.isDirectory() || p.isSymbolicLink()) {
            this.directoryItems.push(
              new DirectoryItem({
                path: p.name,
                // type: getType(r),
                type: 'system',
                icon: 'mdi-folder-text-outline'
              })
            );
          } else if (p.isFile() && RegExp('[.]mp3$').test(p.name)) {
            this.directoryItems.push(
              new DirectoryItem({
                path: p.name,
                // type: getType(r),
                type: 'file',
                icon: 'mdi-file-music-outline'
              })
            );
          }
        } catch (error) {
          console.log(error);
        }
      });
    },
    async directoryDown(nextDir) {
      // push nextDir to currentDir array
      this.currentDir.push(nextDir.path);
      // create full path from currentDir
      const fullPath = this.currentDir.join('/').replace('//', '/');
      // readdirSync using full path
      // update current list of directoryItems
      this.updateDirectoryItems(fullPath);
    },
    async directoryUp() {
      // pop last element in currentDir
      if (this.currentDir.length > 1) {
        this.currentDir.pop(-1, 1);
        // create full path from currentDir
        const fullPath = this.currentDir.join('/').replace('//', '/');
        // readdirSync using full path
        // update current list of directoryItems
        this.updateDirectoryItems(fullPath);
      } else {
        this.toRoot();
      }
    },
    // Todo: navigateTo(fullPath) {},
    async toRoot() {
      this.isLoading = true;

      ipcRenderer
        .invoke('findAllMountedDrives')
        .then(res => {})
        .catch(console.log)
        .finally(x => {
          this.currentDir = [];
          this.isLoading = false;
        });
    }
  },
  created() {
    console.log('created');
    // this.$nextTick(() => {
    ipcRenderer.on('test', (e, args) => {
      console.log('on test');
      console.log(args);
      let temp = args
        .filter(x => x.FileSystem)
        .map(r => {
          switch (r.DriveType) {
            case 2:
              return new DirectoryItem({
                path: `${r.DeviceID}/`,
                // type: getType(r),
                type: r.DriveType,
                icon: 'mdi-usb-port'
              });
            case 3:
              return new DirectoryItem({
                path: `${r.DeviceID}/`,
                // type: getType(r),
                type: r.DriveType,
                icon: 'mdi-harddisk'
              });
            default:
              return;
          }
        });
      this.directoryItems = temp;
      this.isLoading = false;
    });
    this.toRoot();
    // });
  }
};
</script>

<style>
</style>
