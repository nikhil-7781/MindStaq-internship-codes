document.addEventListener('DOMContentLoaded', function() {
    function loadJSON(file, callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', file, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        
                        var jsonData = JSON.parse(xhr.responseText);
                        callback(null, jsonData);
                    } catch (e) {
                        console.error("Failed to parse JSON from " + file, e);
                        callback(e, null);
                    }
                } else {
                    console.error("Failed to load " + file + ". Status: " + xhr.status);
                    callback(new Error("Failed to load " + file), null);
                }
            }
        };
        xhr.send(null);
    }

    loadJSON('node.json', function(err, nodeData) {
        if (err) {
            console.error("Error loading node.json", err);
            return;
        }

        if (!Array.isArray(nodeData)) {
            console.error("node.json is not an array", nodeData);
            return;
        }

        loadJSON('edge.json', function(err, edgeData) {
            if (err) {
                console.error("Error loading edge.json", err);
                return;
            }

            if (!Array.isArray(edgeData)) {
                console.error("edge.json is not an array", edgeData);
                return;
            }

            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: [],
                style: [
                    {
                        selector: 'node',
                        style: {
                            'label': 'data(name)',
                            'width': '10px',
                            'height': '10px',
                            'background-color': '#0074D9'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 1,
                            'line-color': '#0074D9',
                            'target-arrow-color': '#0074D9',
                            'target-arrow-shape': 'triangle'
                        }
                    }
                ],
                layout: {
                    name: 'preset',
                    padding: 10
                }
            });

            
            nodeData.forEach(function(node) {
                cy.add({
                    group: 'nodes',
                    data: { id: node.uid.toString(), name: node.name },
                    position: { x: node.x, y: node.y }
                });
            });

            
            edgeData.forEach(function(edge) {
                cy.add({
                    group: 'edges',
                    data: { id: edge.from.toString() + '-' + edge.to.toString(), source: edge.from.toString(), target: edge.to.toString() }
                });
            });

            
            cy.fit();
        });
    });
});
