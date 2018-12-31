cytoscape-edge-connections
==========================


## Description

Allows edges to be connected to other edges, according to the Associative Model of Data
([demo](https://jri.github.io/cytoscape-edge-connections)).


## Dependencies

* Cytoscape.js ^3.2.0


## Usage instructions

Download the library:

* via npm: `npm install cytoscape-edge-connections`, or
* via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

**ES6** import:

```js
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';

cytoscape.use(edgeConnections);     // register extension
```

**CommonJS** require:

```js
let cytoscape = require('cytoscape');
let edgeConnections = require('cytoscape-edge-connections');

cytoscape.use(edgeConnections);     // register extension
```

**AMD**:

```js
require(['cytoscape', 'cytoscape-edge-connections'], function (cytoscape, edgeConnections) {
  edgeConnections(cytoscape);       // register extension
});
```

**Plain HTML/JS** has the extension registered for you automatically, because no `require()` is needed.


## API

5 methods are available:

* `cy.addEdge()` adds an edge to the graph
* `cy.addEdges()` adds all edges of the given array to the graph
* `edge.auxNode()` returns an edge's aux node
* `node.isAuxNode()` returns `true` if a node is an aux node, `false` otherwise
* `node.edgeId()` returns the ID of the edge represented by an aux node; `undefined` if the node is not an aux node


## Build

1. `npm install` : installs Webpack and Babel into `./node_modules`
2. `npm run build` : builds `./src/**` into `./dist/cytoscape-edge-connections.min.js`


## Version history

**0.1** -- Dec 30, 2018

* Initial version; functional
