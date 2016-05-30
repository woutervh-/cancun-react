var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
    context: __dirname,
    devtool: 'cheap-module-eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        path.resolve(__dirname, 'src', 'main.js')
    ],
    output: {
        path: path.resolve(__dirname, 'development'),
        filename: 'javascripts/bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss', '.json', '.svg'],
        modulesDirectories: [
            'node_modules',
            path.resolve(__dirname, './node_modules')
        ]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react', 'stage-0', 'react-hmre']
                }
            }, {
                test: /\.s?css$/,
                loader: 'style!css?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!sass!toolbox'
            }, {
                test: /\.svg$/,
                loader: 'url'
            }
        ]
    },
    toolbox: {
        theme: path.join(__dirname, 'src', 'toolbox-theme.scss')
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};
