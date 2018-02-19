Graphics.ImageCache = (function () {
  class ImageCache {
    constructor() {
      this.images = {};
    }

    put(key, src) {
      if (!this.images[key]) {
        this.images[key] = new Image();
        this.images[key].src = src;
      }
    }

    get(key) {
      return this.images[key];
    }
  }

  return new ImageCache();
})();
