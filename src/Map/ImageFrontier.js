import Heap from 'heap';

const poolSize = 8;

export default class ImageFrontier {
    constructor() {
        this.sourceQueue = new Heap((a, b) => b.priority - a.priority);
        this.sourceToImage = {};
        this.sourceToCallback = {};
        this.countLoading = 0;
    }

    task() {
        while (this.countLoading < poolSize && this.countLoading < this.sourceQueue.size()) {
            let source = this.sourceQueue.pop().source;
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

    fetch(source, priority = 0) {
        this.sourceQueue.push({source, priority});
        setImmediate(this.task.bind(this));
    }

    setCallback(source, callback) {
        this.sourceToCallback[source] = callback;
    }

    clear() {
        while (this.sourceQueue.size() > 0) {
            this.sourceQueue.pop();
        }
        this.sourceToCallback = {};
    }
};
