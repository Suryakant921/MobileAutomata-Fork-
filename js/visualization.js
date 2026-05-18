// D3-based rendering of the graph, agent, ports, and pebbles.

const AGENT_RADIUS = 8;
const NODE_RADIUS = 15;
const PEBBLE_RADIUS = 6;
const LINK_DISTANCE = 80;
const CHARGE_STRENGTH = -300;
const PORT_OFFSET = 0.25;

export function createVisualization(container, { nodes, links, adj }) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(LINK_DISTANCE))
        .force("charge", d3.forceManyBody().strength(CHARGE_STRENGTH))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const linkSel = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link");

    const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(buildDrag(simulation));

    nodeGroup.append("circle")
        .attr("class", "node")
        .attr("r", NODE_RADIUS);

    const pebbleIndicators = nodeGroup.append("circle")
        .attr("class", "pebble")
        .attr("r", PEBBLE_RADIUS)
        .attr("cx", 10)
        .attr("cy", -10)
        .style("opacity", 0);

    nodeGroup.append("text")
        .attr("class", "node-label")
        .text(d => d.id);

    const portData = adj.flatMap((neighbors, u) =>
        neighbors.map(n => ({ u, v: n.neighbor, port: n.port }))
    );

    const portLabels = svg.append("g")
        .selectAll("text")
        .data(portData)
        .join("text")
        .attr("class", "port-label")
        .text(d => d.port);

    const agentGraphic = svg.append("circle")
        .attr("class", "agent")
        .attr("r", AGENT_RADIUS);

    let agentNodeId = 0;

    function updateAgent() {
        const node = nodes[agentNodeId];
        if (node.x == null) return;
        agentGraphic.attr("cx", node.x).attr("cy", node.y);
    }

    simulation.on("tick", () => {
        linkSel
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);

        portLabels
            .attr("x", d => nodes[d.u].x + (nodes[d.v].x - nodes[d.u].x) * PORT_OFFSET)
            .attr("y", d => nodes[d.u].y + (nodes[d.v].y - nodes[d.u].y) * PORT_OFFSET);

        updateAgent();
    });

    return {
        setAgentNode(id) {
            agentNodeId = id;
            updateAgent();
        },
        showPebble(nodeId) {
            pebbleIndicators.filter(d => d.id === nodeId).style("opacity", 1);
        },
        hideAllPebbles() {
            pebbleIndicators.style("opacity", 0);
        },
    };
}

function buildDrag(simulation) {
    function started(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function ended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag().on("start", started).on("drag", dragged).on("end", ended);
}
