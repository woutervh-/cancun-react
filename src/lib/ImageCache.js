class ImageWrapper {
    constructor(source) {
        this.image = new Image();
        this.image.src = source;
    }

    getHeight() {
        return this.image.naturalHeight;
    }

    getWidth() {
        return this.image.naturalWidth;
    }

    getRawImage() {
        return this.image;
    }

    isLoaded() {
        return this.image.complete;
    }

    onLoad(callback) {
        this.image.onload = callback;
    }
}

export default class ImageCache {
    constructor() {
        this.cache = {};
    }

    get(source) {
        if (source in this.cache) {
            return this.cache[source];
        } else {
            let image = new ImageWrapper(source);
            this.cache[source] = image;
            return image;
        }
    }
}
