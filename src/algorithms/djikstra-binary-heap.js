/*! pathfinding-visualiser | (c) 2014 Daniel Imms | https://github.com/Tyriar/pathfinding-visualiser/blob/master/LICENSE */
// UMD pattern: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['core', 'canvas-helper', 'binary-heap', 'map-node', 'djikstra-common'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('../core'),
                             require('../canvas-helper'),
                             require('../../bower_components/js-data-structures/src/binary-heap'),
                             require('../map-node'),
                             require('./djikstra-common'));
  } else {
    root.djikstraBinaryHeap = factory(core, canvasHelper, BinaryHeap, MapNode, aStarCommon);
  }
}(this, function (core, canvasHelper, BinaryHeap, MapNode, djikstraCommon) {
  'use strict';

  var module = {};

  module.run = function (map, callback) {
    var dist = {};
    var queue = new BinaryHeap();
    var queueNodes = {};
    var queuedPaints = [];
    var key, x, y, i;

    dist[map.start.x + ',' + map.start.y] = 0;
    queue.insert(0, map.start);
    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        key = x + ',' + y;
        if (dist[key] === undefined) {
          dist[key] = Number.MAX_VALUE;
        }
        var node = new MapNode(x, y);
        var heapNode = queue.insert(dist[key], node);
        queueNodes[key] = heapNode;
      }
    }

    while (!queue.isEmpty()) {
      var min = queue.extractMinimum();
      var neighbours = djikstraCommon.getNeighbourNodes(map, min.value, queueNodes);
      for (i = 0; i < neighbours.length; i++) {
        key = neighbours[i].x + ',' + neighbours[i].y;
        var alt = dist[min.value.x + ',' + min.value.y] + neighbours[i].g;
        if (alt < dist[key]) {
          dist[key] = alt;
          neighbours[i].parent = min.value;
          if (neighbours[i].equals(map.goal)) {
            var finish = core.timeNow());
            var visitedNodeCount = 0;
            var distKeys = Object.keys(dist);
            for (var j = 0; j < distKeys.length; j++) {
              if (dist[distKeys[j]] < Number.MAX_VALUE) {
                visitedNodeCount++;
              }
            }
            var message = djikstraCommon.buildSummaryMessage(map, visitedNodeCount);
            callback(message, queuedPaints, neighbours[i], [], finish);
            return;
          }

          queuedPaints.push({
            f: canvasHelper.drawVisited,
            x: neighbours[i].x,
            y: neighbours[i].y
          });
          queue.decreaseKey(queueNodes[key], alt);
        }
      }
    }

    callback([{ result: 'No path exists' }], queuedPaints, undefined, undefined, core.timeNow());
  };

  return module;
}));
