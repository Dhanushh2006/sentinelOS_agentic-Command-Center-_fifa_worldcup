/**
 * SentinelOS - OperationsMap Subsystem
 * Coordinates rendering status classes on stadium coordinates and hotspot manual logs.
 */

const OperationsMap = {
  render() {
    const mapNodes = {
      "Gate A": "hotspot-gate-a",
      "Gate B": "hotspot-gate-b",
      "Gate C": "hotspot-gate-c",
      "Gate D": "hotspot-gate-d",
      "Transit Platform": "hotspot-transit",
      "Concourse Level 2 East": "hotspot-concourse-e"
    };

    Object.entries(state.stadiumState).forEach(([zone, elemId]) => {
      const status = state.stadiumState[zone];
      const elementG = document.getElementById(mapNodes[zone]);
      if (elementG) {
        const circle = elementG.querySelector("circle");
        if (circle) {
          circle.className.baseVal = ""; // Reset
          if (status === "GREEN") {
            circle.classList.add("pulse-green");
          } else if (status === "AMBER") {
            circle.classList.add("pulse-amber");
          } else if (status === "RED") {
            circle.classList.add("pulse-red");
          }
        }
      }
    });

    // Render global status summaries safely
    let redCount = 0;
    let amberCount = 0;
    Object.values(state.stadiumState).forEach(status => {
      if (status === "RED") redCount++;
      if (status === "AMBER") amberCount++;
    });

    if (redCount > 0) {
      elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold";
      elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-400 animate-ping"></span><span>${escapeHTML(String(redCount))} CRITICAL INCIDENTS DETECTED</span>`;
    } else if (amberCount > 0) {
      elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold";
      elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span>${escapeHTML(String(amberCount))} ZONE WARNINGS ACTIVE</span>`;
    } else {
      elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold";
      elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>SYSTEM HEALTHY</span>`;
    }
  },

  inspect(zoneName) {
    const currentStatus = state.stadiumState[zoneName] || "GREEN";
    CommandTerminal.log(`Inspecting coordinate node: ${zoneName}...`, "info");
    
    setTimeout(() => {
      if (currentStatus === "GREEN") {
        CommandTerminal.log(`${zoneName} Status: CLEAR. No operational bottlenecks detected. Ingress/egress ratios standard.`, "success");
      } else if (currentStatus === "AMBER") {
        CommandTerminal.log(`${zoneName} Status: WARNING. Elevated density levels or system lag detected. Reviewing resolution actions.`, "warning");
      } else {
        CommandTerminal.log(`${zoneName} Status: CRITICAL. Incidents active. Multi-agent solver engaged. Immediate response required.`, "error");
      }
    }, 400);
  }
};

// Bind to window for map coordinate onclick triggers
window.inspectHotspot = function(zoneName) {
  OperationsMap.inspect(zoneName);
};
