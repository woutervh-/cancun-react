import glReact from 'gl-react';
import React from 'react';

let shaders = glReact.Shaders.create({
    picture: {
        frag: require('./picture.frag')
    }
}, function () {
});

export default glReact.createComponent(
    ({src, ...rest}) => {
        return <glReact.Node
            {...rest}
            shader={shaders.picture}
            uniforms={{image: src}}
        />;
    }
);
