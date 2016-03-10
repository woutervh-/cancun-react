var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/main.js'),

    output: {
        path: path.resolve(__dirname, 'public/javascripts'),
        filename: 'bundle.js'
    },

    devtool: "source-map",

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                }
            }
        ]
    }
};
