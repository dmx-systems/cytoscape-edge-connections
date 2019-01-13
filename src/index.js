// default config
let MAX_PASSES = 10

let cy

module.exports = register

// register at global Cytoscape (i.e. window.cytoscape)
if (typeof cytoscape !== 'undefined') {
  register(cytoscape)
}

function register (cytoscape) {
  cytoscape('core', 'edgeConnections', edgeConnections)
};

function edgeConnections (config = {}) {
  cy = this
  //
  config.maxPasses && (MAX_PASSES = config.maxPasses)
  //
  cy.style()
    .selector('node.aux-node')
    .style({
      'background-color': colorAuxNode
    })
  //
  eventHandlers()
  //
  // export public API
  return {
    addEdge,
    addEdges,
    auxNode,
    isAuxNode,
    edgeId,
    edge
  }
}

/**
 * @param   edge    Cytoscape edge (POJO); source and target IDs may refer to another edge
 */
function addEdge (edge) {
  if (!_addEdge(edge)) {
    console.warn('Edge can\'t be added to graph as a player does not exist', edge)
  }
}

/**
 * @param   edges   array of Cytoscape edge (POJO); source and target IDs may refer to another edge
 */
function addEdges (edges) {
  let pass = 0
  do {
    edges = edges.filter(edge => !_addEdge(edge))
    if (++pass === MAX_PASSES) {
      throw Error(`too many add-edges passes (limit is ${MAX_PASSES})`)
    }
  } while (edges.length)
  console.log(`This graph needed ${pass} add-edges passes`)
}

/**
 * @param   edge    Cytoscape edge (POJO).
 *                  Source and target IDs may refer to another edge.
 *                  Source and target IDs may be strings or numbers.
 */
function _addEdge (edge) {
  if (resolve(edge, 'source') && resolve(edge, 'target')) {
    createAuxNode(cy.add(edge))
    return true
  }
}

/**
 * Resolves an edge end. Manipulates the edge in-place.
 *
 * @param     edge    Note: for the edge's source/target IDs both ist supported, string or number
 * @param     end     the end to resolve: 'source' or 'target' (string)
 *
 * @return    true if the edge end could be resolved
 */
function resolve (edge, end) {
  const id = edge.data[end]
  const ele = cy.getElementById(id.toString())    // user may provide number source/target IDs
  if (ele.empty()) {
    return false
  }
  if (ele.isEdge()) {
    edge.data[end] = _auxNodeId(ele)
  }
  return true
}

/**
 * Creates and adds an aux node that represents the given edge.
 */
function createAuxNode (edge) {
  const p1 = edge.source().position()
  const p2 = edge.target().position()
  const auxNode = cy.add({
    // FIXME: use edge.midpoint() but midpoint is undefined immediately after add()
    // https://github.com/cytoscape/cytoscape.js/issues/2250
    position: {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    },
    data: {
      edgeId: edge.id()
    },
    classes: 'aux-node'
  }).lock()
  // console.log("Creating aux node", auxNode.id(), auxNode.position())
  edge.data('auxNodeId', auxNode.id())
}

function colorAuxNode (auxNode) {
  // Note: between removing an edge and removing its aux node colorAuxNode() is still called.
  // If a style mapping function returns null/undefined Cytoscape issues a warning.
  const _edge = edge(auxNode)
  return _edge ? _edge.style('line-color') : 'white'      // 'white' suppresses warning
}

function eventHandlers () {
  // Note: for edge connecting edges aux node position changes must cascade. So the position event selector
  // must capture both aux nodes and regular nodes.
  // FIXME: also the edge handler node is captured (in case the cytoscape-edgehandles extension is used),
  // but should not be a problem.
  cy.on('position', 'node', e => repositionAuxNodes(e.target))    // reposition aux nodes once node moves
  cy.on('remove', 'edge', e => removeAuxNode(e.target))           // remove aux node once edge is removed
  cy.on('style', 'edge', e => cy.style().update())                // recolor aux node once edge color changes
}

function repositionAuxNodes (node) {
  node.connectedEdges().forEach(edge => {
    const _auxNode = auxNode(edge)
    if (_auxNode) {
      const midpoint = edge.midpoint()
      // Note: if Cytoscape can't draw the edge (a warning appears in the browser console) its midpoint is undefined
      // (x and y are NaN). If a node is positioned to such an invalid position its canvas representation becomes
      // corrupt (drawImage() throws "InvalidStateError: The object is in an invalid state" then).
      // console.log('repositionAuxNodes', _auxNode.id(), midpoint, isValidPos(midpoint))
      if (isValidPos(midpoint)) {
        _auxNode.unlock().position(midpoint).lock()
      }
    }
  })
}

function removeAuxNode (edge) {
  // console.log('removeAuxNode of edge', edge.id(), cy.getElementById(edge.id()).size())
  const _auxNode = auxNode(edge)
  _auxNode && _auxNode.remove()
}

/**
 * Returns the edge's aux node.
 *
 * @throws  Error   if called on an object that is not an edge.
 * @throws  Error   in case of data inconsistency (edge has "auxNodeId" data but the referred node is not in the graph).
 *
 * @return  the edge's aux node (one-element Cytoscape collection); `undefined` if the edge has no aux node.
 */
function auxNode (edge) {
  if (!edge || !edge.isEdge()) {
    console.warn('auxNode() is called on', edge)
    throw Error('auxNode() is not called on an edge')
  }
  const auxNodeId = _auxNodeIdIfAvailable(edge)
  if (!auxNodeId) {
    return
  }
  const auxNode = edge.cy().getElementById(auxNodeId)
  if (auxNode.empty()) {
    console.warn('Data inconsistency: aux node of edge', edge, 'not in graph, auxNodeId', auxNodeId)
    throw Error(`data inconsistency: aux node of edge ${edge.id()} not in graph`)
  }
  return auxNode
}

/**
 * @throws  Error   if the edge has no "auxNodeId" data.
 *
 * @return  the aux node ID (string) of the given edge.
 */
function _auxNodeId (edge) {
  const auxNodeId = _auxNodeIdIfAvailable(edge)
  if (!auxNodeId) {
    console.warn('Edge has no "auxNodeId" data', edge)
    throw Error(`edge ${edge.id()} has no "auxNodeId" data`)
  }
  return auxNodeId
}

/**
 * @return  the aux node ID (string) of the given edge; `undefined` if the edge has no "auxNodeId" data.
 */
function _auxNodeIdIfAvailable (edge) {
  return edge.data('auxNodeId')
}

/**
 * @return  true if the node is an aux node, false otherwise.
 */
function isAuxNode (node) {
  return edgeId(node) !== undefined
}

/**
 * Returns the aux node's edge.
 *
 * @throws  Error   if the passed object is not an aux node.
 *
 * @return  the aux node's edge; `undefined` if the edge is not in the graph (anymore).
 */
function edge (auxNode) {
  const _edgeId = edgeId(auxNode)
  if (!_edgeId) {
    console.warn('Not an aux node:', auxNode)
    throw Error('arg passed to edge() is not an aux node')
  }
  const edge = cy.getElementById(_edgeId)
  if (edge.size()) {
    return edge
  }
}

/**
 * Returns the aux node's edge ID.
 *
 * @throws  Error   if called on an object that is not a node.
 *
 * @return  the aux node's edge ID (string); `undefined` if this is not an aux node.
 */
function edgeId (node) {
  if (!node || !node.isNode()) {
    console.warn('edgeId() is called on', node)
    throw Error('edgeId() is not called on a node')
  }
  return node.data('edgeId')
}

function isValidPos(pos) {
  // Sometimes pos.x/y are NaN, sometimes undefined. (The latter happens in conjunction with a cose-bilkent
  // layout possibly run too early, when the Cytoscape instance is not yet ready.) TODO: investigate.
  // Global isNan() coerces to number and then checks; Number.isNaN() checks immediately.
  // Note: Number.isNaN(undefined) === false, isNaN(undefined) === true
  return !(isNaN(pos.x) || isNaN(pos.y))
}
