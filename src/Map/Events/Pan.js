export default class Pan {
    constructor(element) {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        element.addEventListener('mousedown', this.handleMouseDown);
        element.addEventListener('mousemove', this.handleMouseMove);
        element.addEventListener('mouseup', this.handleMouseUp);
        element.addEventListener('touchstart', this.handleTouchStart);
        element.addEventListener('touchmove', this.handleTouchMove);
        element.addEventListener('touchend', this.handleTouchEnd);
    }

    handleMouseDown(event) {
        this.possible();
        this.recognized();
    }

    handleMouseMove(event) {
        
    }

    handleMouseUp(event) {

    }

    handleTouchStart(event) {

    }

    handleTouchMove(event) {

    }

    handleTouchEnd(event) {

    }
};
