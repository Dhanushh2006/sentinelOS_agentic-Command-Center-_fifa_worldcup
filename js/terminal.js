/**
 * SentinelOS - CommandTerminal Subsystem
 * Sanitizes and parses CLI prompts using regex maps and coordinates dispatches.
 */

const CommandTerminal = {
  log(message, type = "info") {
    const div = document.createElement("div");
    if (type === "error") {
      div.className = "text-red-500 font-bold";
    } else if (type === "success") {
      div.className = "text-emerald-400 font-medium";
    } else if (type === "warning") {
      div.className = "text-amber-400";
    } else {
      div.className = "text-cyan-400";
    }
    // Double safe: escapes HTML inside textContent
    div.textContent = `> ${escapeHTML(message)}`;
    elements.consoleChatLog.appendChild(div);
    elements.consoleChatLog.scrollTop = elements.consoleChatLog.scrollHeight;
  },

  async process(commandText) {
    const sanitizedInput = commandText.trim().substring(0, 150);
    if (!sanitizedInput) return;

    this.log(`Commander CMD: "${sanitizedInput}"`, "success");

    let understood = "Unidentified Command";
    let responseMsg = "Instruction acknowledged. Processing general stadium directives.";

    const cmd = sanitizedInput.toLowerCase();

    if (cmd.includes("medical") || cmd.includes("rescue") || cmd.includes("cooling") || cmd.includes("heat")) {
      understood = "Dispatch Emergency Medical Resources";
      responseMsg = "Dispatched emergency cooling volunteers and a mobile medical responder to the requested coordinates.";
    } 
    else if (cmd.includes("transit") || cmd.includes("shuttle") || cmd.includes("bus") || cmd.includes("train")) {
      understood = "Adjust Transit Egress Routes";
      responseMsg = "Rerouting shuttle buses to alternative drop points. Communication with local rail authorities established.";
    } 
    else if (cmd.includes("scanner") || cmd.includes("gate") || cmd.includes("turnstile")) {
      understood = "Deploy Scanner Technicians";
      responseMsg = "Dispatched IT support technicians to the turnstile terminals. Manual scanning apps authorized.";
    } 
    else if (cmd.includes("sustainability") || cmd.includes("waste") || cmd.includes("clean") || cmd.includes("trash")) {
      understood = "Sustainability dispatch";
      responseMsg = "Dispatched waste management squad and cautionary wet-floor signs to Concourse B.";
    }
    else if (cmd.includes("ada") || cmd.includes("wheelchair") || cmd.includes("lift") || cmd.includes("elderly")) {
      understood = "Accessibility assistance deployment";
      responseMsg = "Dispatched Mobility Squad with manual transport chairs to Section 106. Standby shuttles active.";
    }
    else if (cmd.includes("clear") || cmd.includes("resolve") || cmd.includes("green")) {
      understood = "Reset Stadium Alarm Systems";
      responseMsg = "System health check initiated. Restoring all zones to Green status.";
      
      Object.keys(state.stadiumState).forEach(zone => {
        state.stadiumState[zone] = "GREEN";
      });
      OperationsMap.render();
      if (state.activeIncident) {
        state.activeIncident = null;
        elements.actionsChecklist.innerHTML = `<p class="text-xs text-gray-500 italic">Clear command issued. System idle.</p>`;
        elements.actionsCounter.textContent = "0 / 0";
        elements.executeActionsBtn.disabled = true;
        elements.agentDebateFeed.innerHTML = `<div class="text-gray-400 italic text-center py-6">Operational clearance. Monitoring active...</div>`;
      }
    }

    setTimeout(() => {
      this.log(`Parser Match: ${understood.toUpperCase()}`, "warning");
      this.log(`Dispatch: ${responseMsg}`, "info");
    }, 500);
  }
};
