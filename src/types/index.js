export class DirectoryItem {
  path;
  type;
  icon;

  constructor(data) {
    Object.assign(this, data);
  }
}

export class PlaylistItem {
  id;
  title;
  path;
  icon;
  format;
  missing = false;

  constructor(data) {
    Object.assign(this, data);
  }
}

export class Playlist {
  id;
  title;
  path;
  playlistItems;
  errors;
  inErrorState = false;

  constructor(data) {
    Object.assign(this, data);

    this.playlistItems = (this.playlistItems || []).map(x => new PlaylistItem(x));
  }

  checkValidity() {}

  addItems(items = []) {}

  removeItems(items = []) {}

  delete() {}

  save() {}
}
