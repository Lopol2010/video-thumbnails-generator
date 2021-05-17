const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => {
    env.platform = env.platform || "chrome"
    return {
        context: path.resolve(__dirname, 'src'),
        devtool: env.development ? 'inline-source-map' : false,
        entry: {
            'background': './background.js',
            'content': './content.js',
            'popup/popup': './popup/popup.js',

        },
        mode: env.development ? 'development' : 'production',
        output: {
            path: path.join(__dirname, 'dist-' + (env.development ? 'dev' : env.platform)),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    // exclude: /content\.sass$/,
                    use: [
                        env.development ? 
                            {
                                loader: 'style-loader',
                                options: {
                                    // This is needed if extension loaded at document_start in chrome, when no DOM exists.
                                    insert: function (element) {
                                        document.addEventListener('DOMContentLoaded', e => {
                                            document.querySelector('head').append(element)
                                        })
                                    }
                                }
                            }
                            : CssExtractPlugin.loader, 
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[local]--[hash:base64:5]', // add hash to classnames so that they dont mess up with site's styles
                                    exportLocalsConvention: 'camelCase'
                                }
                            }
                        },
                        // 'postcss-loader', TODO: configure this
                        'sass-loader']
                },
                {
                    test: /\.js$/,
                    exclude: /\/node_modules\//,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.sass']
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'popup/popup.html',
                chunks: ['popup/popup'],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: './manifest.json' },
                    // {from: './style', to: './style', cache: true},
                    { from: './icons', to: './icons' },
                    // {from: './popup/popup.html', to: './popup'},
                ]
            }),
            new CssExtractPlugin(),
            new webpack.DefinePlugin({
                BUILD_PLATFORM: JSON.stringify(env.platform)
            })
        ]
    }
}