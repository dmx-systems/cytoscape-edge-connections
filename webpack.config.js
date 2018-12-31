module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'cytoscape-edge-connections.js',
    library: 'cytoscapeEdgeConnections',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
