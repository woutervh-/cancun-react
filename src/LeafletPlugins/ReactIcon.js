import ReactDOM from 'react-dom';

export default Leaflet => {
    Leaflet.ReactIcon = Leaflet.Icon.extend({
        options: {},

        initialize: function (options = {}) {
            options.container = options.container || document.createElement('div');
            Leaflet.Util.setOptions(this, options);
        },

        createIcon: function () {
            if (!!this.options.iconAnchor) {
                this.options.container.style.marginLeft = (-this.options.iconAnchor[0]) + 'px';
                this.options.container.style.marginTop = (-this.options.iconAnchor[1]) + 'px';
            }
            ReactDOM.render(this.options.element, this.options.container);
            return this.options.container;
        },

        createShadow: function () {
            return null;
        }
    });
};
