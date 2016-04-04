const poolSize = 64;

export default class ImageFrontier {
    constructor() {
        this.sourceQueue = [];
        this.sourceToImage = {};
        this.sourceToCallback = {};
        this.countLoading = 0;
    }

    task() {
        while (this.countLoading < poolSize && this.countLoading < this.sourceQueue.length) {
            let source = this.sourceQueue.shift();
            if (!(source in this.sourceToImage)) {
                this.countLoading += 1;
                this.sourceToImage[source] = new Image();
                this.sourceToImage[source].src = source;
                let handleOnLoad = () => {
                    this.countLoading -= 1;
                    if (!!this.sourceToCallback[source]) {
                        this.sourceToCallback[source](this.sourceToImage[source]);
                    }
                };
                if (this.sourceToImage[source].complete) {
                    handleOnLoad();
                } else {
                    this.sourceToImage[source].onload = () => {
                        handleOnLoad();
                        setImmediate(this.task.bind(this));
                    };
                }
            }
        }
    }

    isLoaded(source) {
        return source in this.sourceToImage && this.sourceToImage[source].complete;
    }

    getLoadedImage(source) {
        return this.sourceToImage[source];
    }

    fetch(source) {
        this.sourceQueue.push(source);
        setImmediate(this.task.bind(this));
    }

    setCallback(source, callback) {
        this.sourceToCallback[source] = callback;
    }

    clear() {
        this.sourceQueue = [];
        this.sourceToCallback = {};
    }
}
