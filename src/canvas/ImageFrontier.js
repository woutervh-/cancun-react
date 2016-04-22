import Heap from 'heap';

const poolSize = 64;

export default class ImageFrontier {
    constructor(compareFunction) {
        this.sourceHeap = new Heap(compareFunction);
        this.sourceToImage = {};
        this.sourceToCallback = {};
        this.countLoading = 0;
    }

    task() {
        while (this.countLoading < poolSize && this.countLoading < this.sourceHeap.size()) {
            let source = this.sourceHeap.pop();
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
        this.sourceHeap.push(source);
        setImmediate(this.task.bind(this));
    }

    setCallback(source, callback) {
        this.sourceToCallback[source] = callback;
    }

    clear() {
        for (let i = 0; i < this.sourceHeap.size(); i++) {
            this.sourceHeap.pop();
        }
        this.sourceToCallback = {};
    }
};
