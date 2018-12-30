cytoscape-edge-connections
==========================


## Description

Allows edges to be connected to other edges, according to the Associative Model of Data ([demo](https://jri.github.io/cytoscape-edge-connections))


## Dependencies

 * Cytoscape.js ^3.2.0


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-edge-connections`,
 * via bower: `bower install cytoscape-edge-connections`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';

cytoscape.use( edgeConnections );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let edgeConnections = require('cytoscape-edge-connections');

cytoscape.use( edgeConnections ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-edge-connections'], function( cytoscape, edgeConnections ){
  edgeConnections( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

5 methods are available:

* `cy.addEdge()` adds an edge to the graph
* `cy.addEdges()` adds all edges of the given array to the graph
* `edge.auxNode()` returns an edge's aux node
* `node.isAuxNode()` returns `true` if a node is an aux node, `false` otherwise
* `node.edgeId()` returns the ID of the edge represented by an aux node; `undefined` if the node is not an aux node


## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape-edge-connections.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Build the extension : `npm run build:release`
1. Commit the build : `git commit -am "Build for release"`
1. Bump the version number and tag: `npm version major|minor|patch`
1. Push to origin: `git push && git push --tags`
1. Publish to npm: `npm publish .`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-edge-connections https://github.com/jri/cytoscape-edge-connections.git`
1. [Make a new release](https://github.com/jri/cytoscape-edge-connections/releases/new) for Zenodo.


## Version history

**0.1** -- Dec 30, 2018

* Initial version; functional


------------
Jörg Richter  
Dec 30, 2018
