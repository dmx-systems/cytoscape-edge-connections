module.exports = {
  output: {
    filename: 'cytoscape-edge-connections.min.js',
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
