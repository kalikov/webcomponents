var path = require('path')
var webpack = require('webpack')

function styleConfiguration(name) {
    const context = path.resolve(__dirname, 'style', name);
    return {
        mode: 'development',
        devtool: false,
        context: context,
        entry: '../index.js',
        output: {
            path: path.resolve(__dirname, './build'),
            publicPath: '/',
            filename: `webcomponents-style-${name}.js`,
            library: '__webcomponents_style__',
            libraryTarget: 'global',
            libraryExport: 'default'
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ["raw-loader"],
                }, {
                    test: /\.s[ac]ss$/i,
                    use: ["raw-loader", 'sass-loader'],
                },
            ],
        },
        resolve: {
            modules: [context],
            extensions: ['.css', '.scss', '.sass']
        },
        optimization: {
            moduleIds: "deterministic"
        }
    };
}

const mainConfiguration = {
    mode: 'development',
    devtool: false,
    entry: './build/index.js',
    output: {
        path: path.resolve(__dirname, './build'),
        publicPath: '/build/',
        filename: 'webcomponents.js'
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                use: ['html-loader']
            },
        ],
    },
    resolve: {
        modules: ['build', 'src'],
        extensions: ['.js', '.html']
    },
}

module.exports = [mainConfiguration,
    styleConfiguration("98")
];
//
// if (process.env.NODE_ENV === 'production') {
//     module.exports.devtool = '#source-map'
//     // http://vue-loader.vuejs.org/en/workflow/production.html
//     module.exports.plugins = (module.exports.plugins || []).concat([
//         new webpack.DefinePlugin({
//             'process.env': {
//                 NODE_ENV: '"production"'
//             }
//         }),
//         new webpack.optimize.UglifyJsPlugin({
//             sourceMap: true,
//             compress: {
//                 warnings: false
//             }
//         }),
//         new webpack.LoaderOptionsPlugin({
//             minimize: true
//         })
//     ])
// }