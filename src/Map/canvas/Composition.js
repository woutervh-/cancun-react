import React from 'react';
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
            Group(props).draw(context);
            context.globalCompositeOperation = oldCompositeOperation;
        }
    };
};
