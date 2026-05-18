import { buildGraph } from "./graph.js";
import { createState, step } from "./dma.js";
import { createVisualization } from "./visualization.js";
import { createDashboard } from "./dashboard.js";

const PLAY_INTERVAL_MS = 800;

function init() {
    const { adj, nodes, links } = buildGraph();
    const viz = createVisualization(document.getElementById("visualization"), { nodes, links, adj });
    const dashboard = createDashboard();

    let state = createState();
    let playTimer = null;

    const els = {
        step: document.getElementById("btn-step"),
        play: document.getElementById("btn-play"),
        pause: document.getElementById("btn-pause"),
        reset: document.getElementById("btn-reset"),
        toggle: document.getElementById("pebbles-toggle"),
        toggleBg: document.getElementById("pebble-toggle-bg"),
    };

    function doStep() {
        const pebblesEnabled = els.toggle.checked;
        const result = step(state, nodes, adj, { pebblesEnabled });

        if (result.pebbleDropped) viz.showPebble(result.pebbleNode);
        viz.setAgentNode(state.currentNode);

        dashboard.set({
            node: state.currentNode,
            entry: state.entryPort,
            status: result.status,
            action: result.action,
            exit: result.exitPort,
        });
    }

    function startPlay() {
        els.play.disabled = true;
        els.step.disabled = true;
        els.pause.disabled = false;
        playTimer = setInterval(doStep, PLAY_INTERVAL_MS);
    }

    function stopPlay() {
        els.play.disabled = false;
        els.step.disabled = false;
        els.pause.disabled = true;
        if (playTimer != null) {
            clearInterval(playTimer);
            playTimer = null;
        }
    }

    function reset() {
        stopPlay();
        state = createState();
        nodes.forEach(n => { n.hasPebble = false; });
        viz.hideAllPebbles();
        viz.setAgentNode(state.currentNode);
        dashboard.clear();
    }

    els.step.addEventListener("click", doStep);
    els.play.addEventListener("click", startPlay);
    els.pause.addEventListener("click", stopPlay);
    els.reset.addEventListener("click", reset);

    els.toggle.addEventListener("change", e => {
        els.toggleBg.classList.toggle("active", e.target.checked);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
