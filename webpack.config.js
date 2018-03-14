var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    "babel-polyfill",
    "./public/Breakout/BreakoutController.js"
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        loader: "babel-loader",

        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve(__dirname, "public"),
        ],

        // Only run `.js` and `.jsx` files through Babel
        test: /\.js$/,

        // Options to configure babel with
        query: {
          presets: ['es2015'],
        },
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: "lodash",
      $: "jquery",
      jQuery: "jquery",
      Voronoi: "voronoi"
    })
  ]
};
