import React from 'react';
import Group from './Group';
import objectAssign from 'object-assign';

const defaultProps = {
    reset: false,
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
};

export default function Transform(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    return {
        draw: (context) => {
            context.save();
            if (propsWithDefaults.reset) {
                context.setTransform(propsWithDefaults.a, propsWithDefaults.b, propsWithDefaults.c, propsWithDefaults.d, propsWithDefaults.e, propsWithDefaults.f);
            } else {
                context.transform(propsWithDefaults.a, propsWithDefaults.b, propsWithDefaults.c, propsWithDefaults.d, propsWithDefaults.e, propsWithDefaults.f);
            }
            Group(props).draw(context);
            context.restore();
        }
    };
};
