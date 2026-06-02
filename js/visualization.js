// Cytoscape rendering of the rooted graph with port-labelled edges,
// a pebble overlay, and an agent class on the current node.

const STYLE = [
    {
        selector: "node",
        style: {
            "background-color": "#000000",
            "border-color": "#000000",
            "border-width": 0,
            "label": "data(id)",
            "color": "#000000",
            "font-weight": "normal",
            "font-size": 10,
            "text-valign": "top",
            "text-halign": "center",
            "width": 8,
            "height": 8,
        },
    },
    {
        selector: "node.pebble",
        style: {
            "border-color": "#f39c12",
            "border-width": 5,
        },
    },
    {
        selector: "node.agent",
        style: {
            "background-color": "#e74c3c",
            "color": "white",
        },
    },
    {
        selector: "node.root",
        style: {
            "background-color": "#27ae60",
            "color": "white",
        },
    },
    {
        selector: "node.root.agent",
        style: {
            "background-color": "#e74c3c",
        },
    },
    {
        selector: "edge",
        style: {
            "line-color": "#000000",
            "width": 1,
            "curve-style": "bezier",
            // show weight near the source node (10% along the edge visually)
            "source-label": "data(weight)",
            "source-text-offset": 12,
            "font-size": 10,
            "color": "#000000",
            "text-background-color": "white",
            "text-background-opacity": 0.9,
            "text-background-padding": 1,
        },
    },
];

export function createVisualization(container, graph) {
    const { nodes, edges, rootId, layoutHint, positions } = graph;

    const sortedNodes = [...nodes].sort((a, b) => {
        const aNum = Number(a.id);
        const bNum = Number(b.id);
        const aIsNum = !Number.isNaN(aNum);
        const bIsNum = !Number.isNaN(bNum);
        if (aIsNum && bIsNum) return aNum - bNum;
        if (aIsNum) return -1;
        if (bIsNum) return 1;
        return String(a.id).localeCompare(String(b.id));
    });

    const sortedEdges = [...edges].sort((a, b) => {
        if (a.u !== b.u) return a.u - b.u;
        if (a.v !== b.v) return a.v - b.v;
        return a.portU - b.portU;
    });

    const elements = [
        ...sortedNodes.map(n => ({
            data: { id: String(n.id) },
            position: positions && positions[n.id] ? { ...positions[n.id] } : undefined,
        })),
        ...sortedEdges.map((e, i) => ({
            data: {
                id: `e${i}`,
                source: String(e.u),
                target: String(e.v),
                portU: e.portU,
                portV: e.portV,
                weight: e.weight ?? e.label ?? null,
            },
        })),
    ];

    const layout = pickLayout(layoutHint, positions);

    const cy = cytoscape({
        container,
        elements,
        style: STYLE,
        layout,
        wheelSensitivity: 0.2,
    });

    cy.getElementById(String(rootId)).addClass("root");

    let agentId = null;

    function setAgentNode(id) {
        if (agentId !== null) cy.getElementById(String(agentId)).removeClass("agent");
        agentId = id;
        cy.getElementById(String(id)).addClass("agent");
    }

    function setPebble(nodeId, hasPebble) {
        const el = cy.getElementById(String(nodeId));
        if (hasPebble) el.addClass("pebble"); else el.removeClass("pebble");
    }

    function syncPebbles(nodesArr) {
        for (const n of nodesArr) setPebble(n.id, n.hasPebble);
    }

    function destroy() { cy.destroy(); }

    return { setAgentNode, setPebble, syncPebbles, destroy };
}

function pickLayout(hint, positions) {
    if (positions && Object.keys(positions).length > 0) {
        return { name: "preset" };
    }
    switch (hint) {
        case "circle": return { name: "circle" };
        case "tree": return { name: "breadthfirst", spacingFactor: 1.2 };
        case "preset": return { name: "preset" };
        default: return { name: "cose", animate: false, idealEdgeLength: 90 };
    }
}
