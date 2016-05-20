export default Leaflet => {
    Leaflet.Map.mergeOptions({
        twoFingerZoom: L.Browser.touch && !L.Browser.android23
    });

    Leaflet.Map.TwoFingerZoom = Leaflet.Handler.extend({
        statics: {
            ZOOM_OUT_THRESHOLD: 100
        },

        addHooks: function () {
            Leaflet.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
            Leaflet.DomEvent.on(this._map._container, 'touchend', this._onTouchEnd, this);
        },

        removeHooks: function () {
            Leaflet.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
            Leaflet.DomEvent.off(this._map._container, 'touchend', this._onTouchEnd, this);
        },

        _onTouchStart: function (e) {
            if (e.touches.length == 2) {
                this._touchStartTime = new Date();
            }
        },

        _onTouchEnd: function (e) {
            let map = this._map;
            let touches = e.changedTouches;

            if (this._touchStartTime) {
                Leaflet.DomEvent.preventDefault(e);

                if (new Date() - this._touchStartTime <= Leaflet.Map.TwoFingerZoom.ZOOM_OUT_THRESHOLD) {
                    this._touchStartTime = null;
                    map.zoomOut();
                }

            }
        }
    });

    Leaflet.Map.addInitHook('addHandler', 'twoFingerZoom', Leaflet.Map.TwoFingerZoom);
};
