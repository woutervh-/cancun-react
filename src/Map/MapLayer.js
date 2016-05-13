import React from 'react';

export default function MapLayer(Component) {
    return class MapLayerComposed extends React.Component {
        static propTypes = {
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired,
            render: React.PropTypes.oneOf(['canvas', 'html']).isRequired
        };

        static defaultProps = {
            render: 'canvas'
        };

        render() {
            return <Component {...this.props}>
                {this.props.children}
            </Component>;
        }
    };
};
