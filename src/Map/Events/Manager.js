import Hammer from 'hammerjs';

export default class Manager {
    constructor(element) {
        this.destroy = this.destroy.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.fire = this.fire.bind(this);
        this.handlePanStart = this.handlePanStart.bind(this);
        this.handlePan = this.handlePan.bind(this);
        this.handlePanEnd = this.handlePanEnd.bind(this);
        this.handlePinchStart = this.handlePinchStart.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.handlePinchEnd = this.handlePinchEnd.bind(this);
        this.handleTwoFingerTap = this.handleTwoFingerTap.bind(this);
        this.handleDoubleTap = this.handleDoubleTap.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleTap = this.handleTap.bind(this);
        this.handleWheel = this.handleWheel.bind(this);

        this.handlers = {};

        this.hammer = new Hammer(element);
        let twoFingerTap = new Hammer.Tap({event: 'twofingertap', pointers: 2});
        this.hammer.add(twoFingerTap);
        this.hammer.off('panstart');
        this.hammer.on('panstart', this.handlePanStart);
        this.hammer.off('pan');
        this.hammer.on('pan', this.handlePan);
        this.hammer.off('panend');
        this.hammer.on('panend', this.handlePanEnd);
        this.hammer.off('pinchstart');
        this.hammer.on('pinchstart', this.handlePinchStart);
        this.hammer.off('pinch');
        this.hammer.on('pinch', this.handlePinch);
        this.hammer.off('pinchend');
        this.hammer.on('pinchend', this.handlePinchEnd);
        this.hammer.off('twofingertap');
        this.hammer.on('twofingertap', this.handleTwoFingerTap);
        this.hammer.off('doubletap');
        this.hammer.on('doubletap', this.handleDoubleTap);
        this.hammer.off('tap');
        this.hammer.on('tap', this.handleTap);

        this.hammer.get('pan').set({threshold: 0});
        this.hammer.get('pinch').set({enable: true, threshold: 0.1});

        this.element = element;
        this.element.addEventListener('contextmenu', this.handleContextMenu);
        this.element.addEventListener('wheel', this.handleWheel);
    }

    destroy() {
        this.element.removeEventListener('contextmenu', this.handleContextMenu);
        this.element.removeEventListener('wheel', this.handleWheel);
        this.hammer.stop();
        this.hammer.destroy();
    }

    on(type, handler) {
        if (!(type in this.handlers)) {
            this.handlers[type] = new Set();
        }
        this.handlers[type].add(handler);
    }

    off(type, handler) {
        if (type in this.handlers) {
            this.handlers[type].delete(handler);
        }
    }

    fire(type, event) {
        if (type in this.handlers) {
            this.handlers[type].forEach(handler => handler(event));
        }
    }

    handlePanStart(event) {
        if (event.srcEvent.shiftKey) {
            this.boxZoom = true;
            this.fire('boxstart', event);
        } else {
            this.boxZoom = false;
            this.fire('movestart', event);
        }
    }

    handlePan(event) {
        if (this.boxZoom) {
            this.fire('box', event);
        } else {
            this.fire('move', event);
        }
    }

    handlePanEnd(event) {
        if (this.boxZoom) {
            this.fire('boxend', event);
        } else {
            this.fire('moveend', event);
        }
    }

    handlePinchStart(event) {
        this.fire('pinchstart', event);
    }

    handlePinch(event) {
        this.fire('pinch', event);
    }

    handlePinchEnd(event) {
        this.fire('pinchend', event);
    }

    handleTwoFingerTap(event) {
        this.fire('twofingertap', event);
    }

    handleDoubleTap(event) {
        this.fire('doubletap', event);
    }

    handleContextMenu(event) {
        this.fire('contextmenu', event);
    }

    handleTap(event) {
        this.fire('tap', event);
    }

    handleWheel(event) {
        this.fire('wheel', event);
    }
};
