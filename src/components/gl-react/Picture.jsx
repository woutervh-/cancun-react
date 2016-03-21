import glReact from 'gl-react';
import React from 'react';

let shaders = glReact.Shaders.create({
    picture: {
        frag: require('./picture.vert')
    }
});

export default glReact.createComponent(({image, ...rest}) => {
        return <glReact.Node
            {...rest}
            shader={shaders.picture}
            uniforms={{image: image}}
        />;
    },
    {displayName: "Picture"});
