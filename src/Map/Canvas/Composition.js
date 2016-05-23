import Group from './Group';
import objectAssign from 'object-assign';

const defaultProps = {
    type: 'source-over'
};

export default function Composition(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    return {
        draw: (context) => {
            let oldCompositeOperation = context.globalCompositeOperation;
            context.globalCompositeOperation = propsWithDefaults.type;
            Group(propsWithDefaults).draw(context);
            context.globalCompositeOperation = oldCompositeOperation;
        }
    };
};
