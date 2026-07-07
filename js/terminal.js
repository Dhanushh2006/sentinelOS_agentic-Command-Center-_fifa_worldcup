/**
 * SentinelOS - CommandTerminal Subsystem
 * Sanitizes, validates, and compiles CLI commands using either direct 
 * Google Gemini Generative NLP parsing or local compiler regex fallbacks.
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

    let results = null;

    if (state.apiConfig.mode === "live" && state.apiConfig.apiKey) {
      try {
        this.log("Parsing command with Gemini NLP...", "info");
        results = await this.fetchLiveAPI(sanitizedInput);
      } catch (err) {
        console.error(err);
        this.log(`Gemini NLP parser failed: ${err.message}. Falling back to local compiler.`, "error");
        results = this.localParse(sanitizedInput.toLowerCase());
      }
    } else {
      results = this.localParse(sanitizedInput.toLowerCase());
    }

    setTimeout(() => {
      this.log(`Parser Match: ${results.incidentTitle.toUpperCase()}`, "warning");
      this.log(`Dispatch: ${results.dispatchMsg}`, "info");
    }, 500);
  },

  localParse(cmd) {
    let category = "general";
    let incidentTitle = "Unidentified Command";
    let dispatchMsg = "Instruction acknowledged. Processing general stadium directives.";

    if (cmd.includes("medical") || cmd.includes("rescue") || cmd.includes("cooling") || cmd.includes("heat")) {
      category = "medical";
      incidentTitle = "Dispatch Emergency Medical Resources";
      dispatchMsg = "Dispatched emergency cooling volunteers and a mobile medical responder to the requested coordinates.";
    } 
    else if (cmd.includes("transit") || cmd.includes("shuttle") || cmd.includes("bus") || cmd.includes("train")) {
      category = "transit";
      incidentTitle = "Adjust Transit Egress Routes";
      dispatchMsg = "Rerouting shuttle buses to alternative drop points. Communication with local rail authorities established.";
    } 
    else if (cmd.includes("scanner") || cmd.includes("gate") || cmd.includes("turnstile")) {
      category = "maintenance";
      incidentTitle = "Deploy Scanner Technicians";
      dispatchMsg = "Dispatched IT support technicians to the turnstile terminals. Manual scanning apps authorized.";
    } 
    else if (cmd.includes("sustainability") || cmd.includes("waste") || cmd.includes("clean") || cmd.includes("trash")) {
      category = "sustainability";
      incidentTitle = "Sustainability dispatch";
      dispatchMsg = "Dispatched waste management squad and cautionary wet-floor signs to Concourse B.";
    }
    else if (cmd.includes("ada") || cmd.includes("wheelchair") || cmd.includes("lift") || cmd.includes("elderly")) {
      category = "accessibility";
      incidentTitle = "Accessibility assistance deployment";
      dispatchMsg = "Dispatched Mobility Squad with manual transport chairs to Section 106. Standby shuttles active.";
    }
    else if (cmd.includes("clear") || cmd.includes("resolve") || cmd.includes("green")) {
      category = "general";
      incidentTitle = "Reset Stadium Alarm Systems";
      dispatchMsg = "System health check initiated. Restoring all zones to Green status.";
      
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

    return { category, incidentTitle, dispatchMsg };
  },

  async fetchLiveAPI(commandText) {
    const model = state.apiConfig.model;
    const apiKey = state.apiConfig.apiKey;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const textPrompt = `You are the SentinelOS Command NLP Parser. Parse this operational command directive from a stadium commander: "${commandText}". Identify the matching incident category (medical, transit, maintenance, sustainability, accessibility, or general), extract the dispatches to send, and return a clean, structured JSON response matching this schema:
    {
      "category": "medical | transit | maintenance | sustainability | accessibility | general",
      "dispatchMsg": "A technical, professional description of the action dispatches initiated.",
      "incidentTitle": "A concise action title"
    }`;

    const payload = {
      contents: [{
        parts: [{ text: textPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const json = await response.json();
    const text = json.candidates[0].content.parts[0].text;
    return JSON.parse(text.trim());
  }
};
