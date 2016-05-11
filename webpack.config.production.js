var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var cssExtractTextPlugin = new ExtractTextPlugin(1, "stylesheets/[name].css");

module.exports = {
    devtool: 'source-Map',
    entry: path.resolve(__dirname, 'src/main.js'),
    output: {
        path: path.resolve(__dirname, 'public'),
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
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compressor: {
                warnings: false
            }
        }),
        cssExtractTextPlugin
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                }
            }, {
                test: /\.s?css$/,
                loader: cssExtractTextPlugin.extract('style', '!css?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!sass!toolbox')
            }, {
                /* TODO: in production load such that it renders as <img src="..." .../> */
                test: /\.svg$/,
                loader: 'babel?presets[]=es2015&presets[]=react&presets[]=stage-0!react-svg'
            }
        ]
    },
    toolbox: {
        theme: path.join(__dirname, 'src', 'toolbox-theme.scss')
    }
};
