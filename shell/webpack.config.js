const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: 'http://localhost:3000/',
    clean: true,
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: { shared: path.resolve(__dirname, '../shared') },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        mfeHacker:    'mfeHacker@http://localhost:3001/remoteEntry.js',
        mfeWeather:   'mfeWeather@http://localhost:3002/remoteEntry.js',
        mfePowergrid: 'mfePowergrid@http://localhost:3003/remoteEntry.js',
        mfeBillboard: 'mfeBillboard@http://localhost:3004/remoteEntry.js',
        mfeDrones:    'mfeDrones@http://localhost:3005/remoteEntry.js',
        mfeRadio:     'mfeRadio@http://localhost:3006/remoteEntry.js',
        mfeCitizens:  'mfeCitizens@http://localhost:3007/remoteEntry.js',
        mfeCctv:      'mfeCctv@http://localhost:3008/remoteEntry.js',
        mfeTraffic:   'mfeTraffic@http://localhost:3009/remoteEntry.js',
        mfeHospital:  'mfeHospital@http://localhost:3010/remoteEntry.js',
        mfeOracle:    'mfeOracle@http://localhost:3011/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
