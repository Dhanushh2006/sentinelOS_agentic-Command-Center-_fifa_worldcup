/**
 * SentinelOS - AgentSolver Subsystem
 * Orchestrates multi-agent debate animations, synthesized plans, and actions resolution.
 */

const AgentSolver = {
  debate(scenario) {
    elements.agentDebateFeed.innerHTML = "";
    elements.executeActionsBtn.disabled = true;
    state.activeIncident = scenario;

    this.renderChecklist(scenario.actionPlan);
    this.syncVolunteerBoard(scenario.id);

    let step = 0;
    const debate = scenario.debate;

    const nextSpeech = () => {
      if (step >= debate.length) {
        elements.executeActionsBtn.disabled = false;
        CommandTerminal.log(`Agents Synthesized Resolution Plan. Ready for Commander execution.`, "warning");
        return;
      }

      const item = debate[step];
      
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "p-3 bg-gray-900/40 rounded-xl flex items-center gap-1.5 text-xs text-gray-500 mb-2 border border-dashed border-[rgba(255,255,255,0.05)]";
      typingIndicator.id = `typing-${item.agent}`;
      typingIndicator.innerHTML = `<span>${escapeHTML(item.agent)} is deliberating</span> <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
      elements.agentDebateFeed.appendChild(typingIndicator);
      elements.agentDebateFeed.scrollTop = elements.agentDebateFeed.scrollHeight;

      setTimeout(() => {
        const tip = document.getElementById(`typing-${item.agent}`);
        if (tip) tip.remove();

        const msgDiv = document.createElement("div");
        let borderClass = "border-[rgba(255,255,255,0.06)]";
        let bgClass = "bg-gray-900/40";
        
        if (item.agent === "OpsAgent") { borderClass = "border-purple-500/25"; bgClass = "bg-purple-950/10"; }
        if (item.agent === "CrowdAgent") { borderClass = "border-blue-500/25"; bgClass = "bg-blue-950/10"; }
        if (item.agent === "TransitAgent") { borderClass = "border-amber-500/25"; bgClass = "bg-amber-950/10"; }
        if (item.agent === "RescueAgent") { borderClass = "border-red-500/25"; bgClass = "bg-red-950/10"; }

        msgDiv.className = `agent-message glass-panel p-3 rounded-xl border ${borderClass} ${bgClass} flex flex-col gap-1.5`;
        msgDiv.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold flex items-center gap-1 text-[11px] ${escapeHTML(item.color)}">${escapeHTML(item.avatar)} ${escapeHTML(item.agent.toUpperCase())}</span>
            <span class="text-[8px] text-gray-500 font-mono">CoT Reasoner</span>
          </div>
          <p class="text-gray-200 text-xs leading-relaxed">${escapeHTML(item.message)}</p>
        `;
        elements.agentDebateFeed.appendChild(msgDiv);
        elements.agentDebateFeed.scrollTop = elements.agentDebateFeed.scrollHeight;

        step++;
        setTimeout(nextSpeech, 1800);
      }, 1500);
    };

    nextSpeech();
  },

  renderChecklist(plan) {
    elements.actionsCounter.textContent = `0 / ${plan.length}`;
    elements.actionsChecklist.innerHTML = plan.map(action => `
      <div class="flex items-center gap-2.5 p-2 bg-gray-900/50 rounded-lg border border-[rgba(255,255,255,0.05)] text-[10px]" id="item-${escapeHTML(action.id)}">
        <input type="checkbox" id="check-${escapeHTML(action.id)}" disabled class="rounded border-gray-700 bg-gray-950 text-purple-500 focus:ring-0">
        <label for="check-${escapeHTML(action.id)}" class="text-gray-300 font-light flex-1">${escapeHTML(action.text)}</label>
        <span class="text-[8px] px-1 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">${escapeHTML(action.owner)}</span>
      </div>
    `).join("");
  },

  syncVolunteerBoard(scenarioId) {
    // Dynamically update volunteer assignments tab based on triggered scenario
    const volunteerRoster = document.getElementById("volunteer-roster-body");
    if (!volunteerRoster) return;

    let assignments = [
      { squad: "Squad-Alpha", leader: "Elena Rostova", count: "8 units", status: "ACTIVE", task: "Gate A Turnstile Check" },
      { squad: "Squad-Beta", leader: "Marcus Vance", count: "12 units", status: "ACTIVE", task: "Transit Hub Platform" },
      { squad: "Squad-Gamma", leader: "Aisha Diallo", count: "10 units", status: "STANDBY", task: "East Concourse Plaza" },
      { squad: "Squad-Delta", leader: "Kenji Sato", count: "15 units", status: "STANDBY", task: "Unassigned Reserve" }
    ];

    if (scenarioId === "scenario-gate-bottleneck") {
      assignments[0].task = "Gate D manual ticket scanning assistance";
      assignments[2].status = "ACTIVE";
      assignments[2].task = "Distributing water bottles near cooling tents";
    } else if (scenarioId === "scenario-transit-suspension") {
      assignments[1].task = "Transit plaza crowd density monitoring";
      assignments[2].status = "ACTIVE";
      assignments[2].task = "Directing fans to Rideshare Zone C";
      assignments[3].status = "ACTIVE";
      assignments[3].task = "Distributing transit flyers near station gates";
    } else if (scenarioId === "scenario-fire-hazard") {
      assignments[0].task = "Cordon security Section 214 concourse";
      assignments[2].status = "ACTIVE";
      assignments[2].task = "Guiding Level 2 East evacuations to Gate B";
    } else if (scenarioId === "scenario-sustainability") {
      assignments[2].status = "ACTIVE";
      assignments[2].task = "Placing caution wet-floor slip signs in plaza";
      assignments[3].status = "ACTIVE";
      assignments[3].task = "Directing concession waste overflows to Hub 6";
    } else if (scenarioId === "scenario-accessibility") {
      assignments[0].task = "Electrical squad assist elevator technician";
      assignments[2].status = "ACTIVE";
      assignments[2].task = "Broadcasting ADA notifications (multilingual)";
      assignments[3].status = "ACTIVE";
      assignments[3].task = "Directing mobility golf carts near Gate C";
    }

    volunteerRoster.innerHTML = assignments.map(a => `
      <tr class="h-10 border-b border-[rgba(255,255,255,0.04)]">
        <td class="font-mono text-cyan-400 font-semibold">${escapeHTML(a.squad)}</td>
        <td class="text-gray-300 font-medium">${escapeHTML(a.leader)}</td>
        <td class="text-gray-400">${escapeHTML(a.task)}</td>
        <td class="text-gray-400 text-center">${escapeHTML(a.count)}</td>
        <td>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold ${a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
            ${escapeHTML(a.status)}
          </span>
        </td>
      </tr>
    `).join("");
  },

  execute() {
    if (!state.activeIncident) return;
    
    elements.executeActionsBtn.disabled = true;
    CommandTerminal.log(`Deploying synthesized operations response script...`, "warning");

    const plan = state.activeIncident.actionPlan;
    let idx = 0;

    const checkNext = () => {
      if (idx >= plan.length) {
        CommandTerminal.log(`SUCCESS: All operational actions deployed and resolved. Stadium status stabilized.`, "success");
        
        Object.keys(state.stadiumState).forEach(zone => {
          state.stadiumState[zone] = "GREEN";
        });
        OperationsMap.render();
        state.activeIncident = null;
        elements.actionsChecklist.innerHTML = `<p class="text-xs text-gray-500 italic">Plan successfully executed. Monitoring active...</p>`;
        elements.actionsCounter.textContent = "0 / 0";
        this.syncVolunteerBoard("clear");
        return;
      }

      const action = plan[idx];
      const checkbox = document.getElementById(`check-${action.id}`);
      const row = document.getElementById(`item-${action.id}`);
      if (checkbox && row) {
        checkbox.checked = true;
        row.classList.add("border-emerald-500/30", "bg-emerald-950/10");
        CommandTerminal.log(`Action Executed: [${action.owner}] ${action.text}`, "success");
        elements.actionsCounter.textContent = `${idx + 1} / ${plan.length}`;
      }

      idx++;
      setTimeout(checkNext, 1200);
    };

    checkNext();
  }
};

// Exposed window handlers for solver triggers
window.triggerScenario = function(scenarioId) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  CommandTerminal.log(`COMMAND: Manual scenario trigger initiated: ${scenario.title}`, "warning");
  
  Object.keys(state.stadiumState).forEach(zone => {
    state.stadiumState[zone] = "GREEN";
  });

  if (scenario.hotspotId === "hotspot-gate-d") {
    state.stadiumState["Gate D"] = "RED";
  } else if (scenario.hotspotId === "hotspot-transit") {
    state.stadiumState["Transit Platform"] = "RED";
    state.stadiumState["Gate B"] = "AMBER";
  } else if (scenario.hotspotId === "hotspot-concourse-e") {
    state.stadiumState["Concourse Level 2 East"] = "RED";
    state.stadiumState["Gate C"] = "AMBER";
  }

  OperationsMap.render();
  TabManager.switch("command");
  AgentSolver.debate(scenario);
};
