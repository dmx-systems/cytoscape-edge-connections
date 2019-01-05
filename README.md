cytoscape-edge-connections
==========================


![cytoscape-edge-connections](img/demo.png)


## Description

This Cytoscape extension allows edges to connect other edges, according to the Associative Model of Data
([demo](https://jri.github.io/cytoscape-edge-connections)).

This extension superimposes every edge with an auxiliary node, the "aux node". An aux node represents an edge and acts as a vehicle for connecting that edge.

Note: this extension does *not* emulate an edge by 2 edges with the aux node in the middle. Edges are not structurally changed. Instead the aux node is just superimposed, and the extension cares about keeping the aux node position in-sync with the edge position. This approach has several advantages:

1. The original graph structure is not changed, and existing Cytoscape traversal algorithms continue to work.
2. Cytoscape's advanced edge rendering capabilities (e.g. curved parallel edges) continue to work.
3. Cytoscape's layout algorithms continue to work. Aux nodes are locked and do not participate in layout.

## The Associative Model of Data

Joseph V. Homan, Paul J. Kovacs -- A Comparison Of The Relational Database Model And The Associative Database Model (6 page article)  
*Issues in Information Systems*, Volume X, No. 1, 2009  
http://iacis.org/iis/2009/P2009_1301.pdf

Simon Williams -- The Associative Model Of Data (24 page article)  
*Journal of Database Marketing*, Volume 8, 4, 2001  
https://link.springer.com/content/pdf/10.1057/palgrave.jdm.3240049.pdf

Simon Williams -- The Associative Model Of Data (book, 284 pages)  
*Lazy Software*, 2nd edition, 2002  
http://www.sentences.com/docs/other_docs/AMD.pdf

![amd-schema](img/amd-schema.png)
![amd-instances](img/amd-instances.png)

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

**AMD** require:

```js
require(['cytoscape', 'cytoscape-edge-connections'], function (cytoscape, edgeConnections) {
  edgeConnections(cytoscape);       // register extension
});
```

**Plain HTML/JS** has the extension registered for you automatically, because no `require()` is needed.


## Initialization

You initialize the extension on the Cytoscape instance:

```js
cy.edgeConnections(config);
```

Optionally you can pass a config object.  
The possible config options are as follows:

| Config option  | Description | Default&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
| -------------  | ----------- | ------- |
| `auxNodeData`  | A function that receives an edge and returns a "data" object used by the extension when creating that edge's aux node. Use this option to enrich aux nodes by data, e.g. for individual color styling. | `edge => ({})` |
| `maxPasses`    | See detail about *order* below. | `10` |


## API

The extension adds 2 core and 3 collection methods:

* `cy.addEdge(edge)` adds the edge to the graph; `source` and `target` can refer to another edge
* `cy.addEdges(edges)` adds all the edges of an array to the graph
* `edge.auxNode()` returns the edge's aux node; `undefined` if the edge has no aux node
* `node.isAuxNode()` returns `true` if the node is an aux node, `false` otherwise
* `node.edgeId()` returns the aux node's edge ID; `undefined` if the node is not an aux node

The `addEdge(s)` method(s) accepts usual Cytoscape edge objects (plain JS objects) but with the particularity that the `source` and `target` data can refer to another edge.

**Important:** in order to get edge connectivity you must create edges programmatically, that is by calling the `cy.addEdge(s)` method(s) listed above. Only then 1) the edge will get an aux node, and thus can be the source/target of another edge, and 2) can itself have an edge at their source/target end. In contrast edges created/added the standard way (that is declaratively in the Cytoscape constructor or by calling `cy.add()`) will *not* get edge connectivity.

One more detail about *order*: the `cy.addEdges(edges)` method finds out itself the order in which to add the given edges. There is *no* requirement a referred edge appears in the `edges` array *before* the referring edge. The only requirements are 1) the referred edges are contained in the array *somewhere*, and 2) the referred *nodes* exist in the graph already. (The "find out order" process is governed by the `maxPasses` config value.) In contrast the `cy.addEdge(edge)` (singular) method requires that *both* referred elements (source and target) exist in the graph already, regardless of being node or edge.


## Styling

For every aux node the extension stores an `edgeId` data (as returned by the `node.edgeId()` API call). You can exploit that fact for styling the aux nodes (by using a Cytoscape data selector):

```js
cytoscape({
  style: [
    {
      selector: 'node[edgeId]',
      style: {
        // your aux node style
        'width': 6,
        'height': 6
      }
    }
  ]
})
```

For styling aux nodes *individually* see also the `auxNodeData` config option.


## Build

1. `npm install` : installs Webpack into `./node_modules`
2. `npm run build` : builds `./src/**` into `./dist/cytoscape-edge-connections.min.js`


## Version history

**0.2.1** -- Jan 5, 2019

* README: add styling hint

**0.2** -- Jan 2, 2019

* Extension is general purpose (DMX application specifics removed)
    * 2 config options can be passed to initializer: `auxNodeData`, `maxPasses`
* Fix: aux nodes are not movable by user
* Extended README
* [Demo page](https://jri.github.io/cytoscape-edge-connections)

**0.1** -- Dec 30, 2018

* Initial version; functional
