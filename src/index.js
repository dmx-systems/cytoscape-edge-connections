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
  stylesheet()
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

function stylesheet () {
  cy.style().selector('node.aux-node').style({
    'background-color': 'data(color)'
  })
}

function eventHandlers () {
  // Note: for edge connecting edges aux node position changes must cascade. So the position event selector
  // must capture both aux nodes and regular nodes.
  // FIXME: also the edge handler node is captured (in case the cytoscape-edgehandles extension is used),
  // but should not be a problem.
  cy.on('position', 'node', e => repositionAuxNodes(e.target))    // reposition aux nodes once node moves
  cy.on('remove', 'edge', e => {
    const edge = e.target
    removeAuxNode(edge)                                           // remove aux node once edge is removed
    repositionAuxNodesOfParallelEdges(edge)
  })
  cy.on('style', 'edge', e => recolorAuxNode(e.target))           // recolor aux node once edge color changes
}

/**
 * Adds the edge to the graph.
 *
 * @param   edge    Cytoscape edge (POJO); source and target IDs may refer to another edge
 */
function addEdge (edge) {
  if (!_addEdge(edge)) {
    console.warn(`Edge ${edge.data.id} not added as source/target not in graph`, edge)
  }
}

/**
 * Adds all edges contained in the given array to the graph.
 *
 * @param   edges   array of Cytoscape edge (POJO); source and target IDs may refer to another edge
 */
function addEdges (edges) {
  let pass = 0
  do {
    edges = edges.filter(edge => !_addEdge(edge))
    if (++pass === MAX_PASSES) {
      console.warn(edges.length + ' edges not added to graph due to missing source/target node (giving up after ' +
        MAX_PASSES + ' add-edges passes)', edges)
      break
    }
  } while (edges.length)
  // console.log(`Graph needed ${pass} add-edges passes`)
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
 * @param     edge    Cytoscape edge (POJO).
 *                    Note: for the edge's source/target IDs both is supported, string or number.
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
  const pos = edge.midpoint()
  const auxNode = cy.add({
    classes: 'aux-node',
    position: isValidPos(pos) && pos,     // see comment at repositionAuxNode()
    data: {
      edgeId: edge.id(),
      color:  edge.style('line-color')
    }
  }).lock()
  // console.log("Creating aux node", auxNode.id(), auxNode.position())
  edge.scratch('edgeConnections', {
    auxNodeId: auxNode.id()
  })
  repositionAuxNodesOfParallelEdges(edge)
}

function repositionAuxNodes (node) {
  node.connectedEdges().forEach(repositionAuxNode)
}

function repositionAuxNodesOfParallelEdges (edge) {
  edge.parallelEdges().forEach(repositionAuxNode)
}

function repositionAuxNode (edge) {
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
}

function removeAuxNode (edge) {
  // console.log('removeAuxNode of edge', edge.id(), cy.getElementById(edge.id()).size())
  const _auxNode = auxNode(edge)
  _auxNode && _auxNode.remove()
}

function recolorAuxNode (edge) {
  const _auxNode = auxNode(edge)
  _auxNode && _auxNode.data('color', edge.style('line-color'))
}

/**
 * Returns the given edge's aux node.
 *
 * @throws  Error   if the given object is not an edge.
 * @throws  Error   in case of data inconsistency (edge has "auxNodeId" info but the referred node is not in the graph).
 *
 * @return  the given edge's aux node (one-element Cytoscape collection); `undefined` if the given edge has no aux node.
 */
function auxNode (edge) {
  if (!edge || !edge.isEdge()) {
    console.error('Invalid auxNode() argument (edge expected):', edge)
    throw Error('invalid auxNode() argument')
  }
  const auxNodeId = _auxNodeIdIfAvailable(edge)
  if (!auxNodeId) {
    return
  }
  const auxNode = cy.getElementById(auxNodeId)
  if (auxNode.empty()) {
    console.error('Data inconsistency: aux node of edge', edge, 'not in graph, auxNodeId', auxNodeId)
    throw Error(`data inconsistency: aux node of edge ${edge.id()} not in graph`)
  }
  return auxNode
}

/**
 * @throws  Error   if the edge has no "auxNodeId" info.
 *
 * @return  the aux node ID (string) of the given edge.
 */
function _auxNodeId (edge) {
  const auxNodeId = _auxNodeIdIfAvailable(edge)
  if (!auxNodeId) {
    console.error('Edge has no "auxNodeId" info', edge)
    throw Error(`edge ${edge.id()} has no "auxNodeId" info`)
  }
  return auxNodeId
}

/**
 * @return  the aux node ID (string) of the given edge; `undefined` if the edge has no "auxNodeId" info.
 */
function _auxNodeIdIfAvailable (edge) {
  // Note: not all edges have an aux node and thus a scratchpad
  const scratch = edge.scratch('edgeConnections')
  return scratch && scratch.auxNodeId
}

/**
 * @return  `true` if the given node is an aux node, `false` otherwise.
 */
function isAuxNode (node) {
  return edgeId(node) !== undefined
}

/**
 * Returns the given aux node's edge ID (string).
 *
 * @throws  Error   if the given object is not a node.
 *
 * @return  the given aux node's edge ID (string); `undefined` if the given node is not an aux node.
 */
function edgeId (node) {
  if (!node || !node.isNode()) {
    console.error('Invalid edgeId() argument (node expected):', node)
    throw Error('invalid edgeId() argument')
  }
  return node.data('edgeId')
}

/**
 * Returns the given aux node's edge.
 *
 * @throws  Error   if the given object is not an aux node.
 *
 * @return  the given aux node's edge; `undefined` if the edge is not in the graph (anymore).
 */
function edge (auxNode) {
  const _edgeId = edgeId(auxNode)
  if (!_edgeId) {
    console.error('Invalid edge() argument (aux node expected):', auxNode)
    throw Error('invalid edge() argument')
  }
  const edge = cy.getElementById(_edgeId)
  if (!edge.empty()) {
    return edge
  }
}

function isValidPos(pos) {
  // Note: sometimes pos.x/y are NaN, sometimes undefined. (The latter happens in conjunction with a cose-bilkent
  // layout possibly run too early, when the Cytoscape instance is not yet ready.) TODO: investigate.
  //
  // JS: isNaN(undefined) === true, Number.isNaN(undefined) === false
  // Global isNan() coerces to number and then checks; Number.isNaN() checks immediately.
  return !(isNaN(pos.x) || isNaN(pos.y))
}
