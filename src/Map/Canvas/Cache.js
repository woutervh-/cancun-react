import Group from './Group';
import objectAssign from 'object-assign';

const defaultProps = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    poolId: 0,
    imageId: 0
};

let cache = {};

export default function Cache(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    if (!(propsWithDefaults.poolId in cache) || cache[propsWithDefaults.poolId].imageId != propsWithDefaults.imageId) {
        let cachedCanvas = document.createElement('canvas');
        cachedCanvas.width = propsWithDefaults.width;
        cachedCanvas.height = propsWithDefaults.height;
        let cachedContext = cachedCanvas.getContext('2d');
        Group(propsWithDefaults).draw(cachedContext);
        cache[propsWithDefaults.poolId] = {imageId: propsWithDefaults.imageId, canvas: cachedCanvas};
    }

    return {
        draw: (context) => {
            context.drawImage(cache[propsWithDefaults.poolId].canvas, propsWithDefaults.left, propsWithDefaults.top, propsWithDefaults.width, propsWithDefaults.height);
        }
    };
};
