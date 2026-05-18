// Distributed Mobile Automaton (DMA) walk logic.
//
// Basic Walk (no pebbles): exit port = (entry + 1) mod degree.
// Pebble mode: empty node -> drop pebble and backtrack via entry port;
//              full node  -> standard basic walk.

export const INITIAL_STATE = Object.freeze({
    currentNode: 0,
    entryPort: 0,
    initialized: false,
});

export function createState() {
    return { ...INITIAL_STATE };
}

export function step(state, nodes, adj, { pebblesEnabled }) {
    if (!state.initialized) {
        state.initialized = true;
        return { status: "Start", action: "None", exitPort: "-", pebbleDropped: false };
    }

    const u = state.currentNode;
    const degree = adj[u].length;
    const isFull = nodes[u].hasPebble;

    let action = "Abstain";
    let exitPort;
    let pebbleDropped = false;

    if (pebblesEnabled && !isFull) {
        nodes[u].hasPebble = true;
        action = "Drop Pebble";
        exitPort = state.entryPort;
        pebbleDropped = true;
    } else {
        exitPort = (state.entryPort + 1) % degree;
    }

    const edge = adj[u].find(n => n.port === exitPort);
    state.currentNode = edge.neighbor;
    state.entryPort = edge.neighborPort;

    return {
        status: isFull ? "Full" : "Empty",
        action,
        exitPort,
        pebbleDropped,
        pebbleNode: pebbleDropped ? u : null,
    };
}
