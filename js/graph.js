// Graph data and port-numbered adjacency construction.

export const NUM_NODES = 21;

export const RAW_EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [0, 6], [6, 7], [1, 8], [8, 9], [9, 10],
    [1, 11], [2, 12], [12, 13], [3, 14], [14, 15],
    [14, 16], [4, 17], [17, 18], [17, 19], [17, 20],
];

export function buildGraph(numNodes = NUM_NODES, edges = RAW_EDGES) {
    const adj = Array.from({ length: numNodes }, () => []);

    for (const [u, v] of edges) {
        const portU = adj[u].length;
        const portV = adj[v].length;
        adj[u].push({ neighbor: v, port: portU, neighborPort: portV });
        adj[v].push({ neighbor: u, port: portV, neighborPort: portU });
    }

    const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i, hasPebble: false }));

    const links = [];
    adj.forEach((neighbors, u) => {
        for (const n of neighbors) {
            if (u < n.neighbor) {
                links.push({
                    source: u,
                    target: n.neighbor,
                    portSource: n.port,
                    portTarget: n.neighborPort,
                });
            }
        }
    });

    return { adj, nodes, links };
}
