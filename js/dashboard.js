// Sidebar status panel binding.

const FIELDS = ["node", "entry", "status", "action", "exit"];

export function createDashboard() {
    const els = Object.fromEntries(
        FIELDS.map(f => [f, document.getElementById(`disp-${f}`)])
    );

    function set(values) {
        for (const [k, v] of Object.entries(values)) {
            if (els[k]) els[k].innerText = v;
        }
    }

    function clear() {
        FIELDS.forEach(f => { els[f].innerText = "-"; });
    }

    return { set, clear };
}
