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
                    include: /content\.sass$/,
                    use: [
                        CssExtractPlugin.loader,
                        'css-loader',
                        // 'postcss-loader', TODO: config
                        'sass-loader']
                },
                {
                    test: /\.sass$/,
                    exclude: /content\.sass$/,
                    use: [
                        env.development ? 'style-loader' : CssExtractPlugin.loader, 
                        'css-loader',
                        // 'postcss-loader', TODO: config
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