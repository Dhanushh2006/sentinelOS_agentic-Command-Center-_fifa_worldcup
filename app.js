/**
 * SentinelOS - Core Operation & Decision Intelligence System
 * Clean Modular Architecture (Solid principles) & Strict Input Sanitization.
 */

// Global Sanitization Helper to prevent DOM XSS vulnerabilities
function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// Application State (Deeply encapsulated)
const state = {
  activeIncident: null,
  dialogueHistory: [],
  consoleHistory: [],
  apiConfig: {
    mode: "simulated",
    apiKey: "",
    model: "gemini-2.5-flash"
  },
  stadiumState: {
    "Gate A": "GREEN",
    "Gate B": "GREEN",
    "Gate C": "GREEN",
    "Gate D": "GREEN",
    "Transit Platform": "GREEN",
    "Concourse Level 2 East": "GREEN"
  }
};

// DOM References
const elements = {
  systemStatusPill: document.getElementById("system-status-pill"),
  cctvFeedSelect: document.getElementById("cctv-feed-select"),
  cctvPreviewImage: document.getElementById("cctv-preview-image"),
  cctvTime: document.getElementById("cctv-time"),
  cctvAnalyzeBtn: document.getElementById("cctv-analyze-btn"),
  cctvResultContainer: document.getElementById("cctv-result-container"),
  cvThreatBadge: document.getElementById("cv-threat-badge"),
  cvAnalysisSummary: document.getElementById("cv-analysis-summary"),
  cvHotspots: document.getElementById("cv-hotspots"),
  consoleChatLog: document.getElementById("console-chat-log"),
  commanderConsoleForm: document.getElementById("commander-console-form"),
  consoleCommandInput: document.getElementById("console-command-input"),
  agentDebateFeed: document.getElementById("agent-debate-feed"),
  actionsCounter: document.getElementById("actions-counter"),
  actionsChecklist: document.getElementById("actions-checklist"),
  executeActionsBtn: document.getElementById("execute-actions-btn"),
  aiModeToggle: document.getElementById("ai-mode-toggle"),
  apiKeyContainer: document.getElementById("api-key-container"),
  geminiApiKey: document.getElementById("gemini-api-key"),
  geminiModelSelect: document.getElementById("gemini-model-select"),
  saveConfigBtn: document.getElementById("save-config-btn"),
  tabBreadcrumb: document.getElementById("tab-breadcrumb")
};

// ==========================================
// 1. CONFIGURATION MANAGER (Security & Credentials)
// ==========================================
const ConfigManager = {
  load() {
    try {
      const savedMode = localStorage.getItem("sentinel_mode");
      const savedKey = localStorage.getItem("sentinel_key");
      const savedModel = localStorage.getItem("sentinel_model");

      if (savedMode) state.apiConfig.mode = savedMode;
      if (savedKey) state.apiConfig.apiKey = savedKey;
      if (savedModel) state.apiConfig.model = savedModel;

      elements.aiModeToggle.value = state.apiConfig.mode;
      elements.geminiApiKey.value = state.apiConfig.apiKey;
      elements.geminiModelSelect.value = state.apiConfig.model;

      this.toggleVisibility(state.apiConfig.mode);
    } catch (e) {
      console.error("Local storage load blocked: ", e);
    }
  },

  toggleVisibility(mode) {
    if (mode === "live") {
      elements.apiKeyContainer.classList.remove("hidden");
    } else {
      elements.apiKeyContainer.classList.add("hidden");
    }
  },

  save() {
    // Validate credentials format to prevent basic injections/overflows
    const mode = elements.aiModeToggle.value;
    const rawKey = elements.geminiApiKey.value.trim();
    const model = elements.geminiModelSelect.value;

    if (mode === "live" && rawKey.length > 0) {
      // Validate Google API key format (usually starts with AIzaSy)
      if (!/^AIzaSy[A-Za-z0-9_-]{33}$/.test(rawKey)) {
        alert("Invalid Google Gemini API key format. Should start with 'AIzaSy' and contain 39 characters.");
        return;
      }
    }

    state.apiConfig.mode = mode;
    state.apiConfig.apiKey = rawKey;
    state.apiConfig.model = model;

    try {
      localStorage.setItem("sentinel_mode", mode);
      localStorage.setItem("sentinel_key", rawKey);
      localStorage.setItem("sentinel_model", model);
    } catch (e) {
      console.error("Local storage write failed: ", e);
    }

    CommandTerminal.log(`System: Credentials updated. Mode set to ${mode.toUpperCase()}`);
    alert("AI configurations stored securely.");
  }
};

// ==========================================
// 2. NAVIGATION MANAGER (Workspace routing)
// ==========================================
const TabManager = {
  switch(tabId) {
    const tabs = ["command", "cctv", "transit", "volunteers", "settings"];
    
    tabs.forEach(t => {
      const view = document.getElementById(`tab-view-${t}`);
      if (view) view.classList.add("hidden");
      
      const btn = document.getElementById(`nav-${t}`);
      if (btn) {
        btn.className = "w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all group";
        const icon = btn.querySelector("i");
        if (icon) icon.className.baseVal = icon.className.baseVal.replace("text-cyan-400", "");
      }
    });

    const activeView = document.getElementById(`tab-view-${tabId}`);
    if (activeView) activeView.classList.remove("hidden");

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
      activeBtn.className = "w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.04)] transition-all group";
      const icon = activeBtn.querySelector("i");
      if (icon) icon.classList.add("text-cyan-400");
    }

    const breadcrumbLabels = {
      command: "Command Center",
      cctv: "CCTV Ingestion Directory",
      transit: "Transit Platform Status",
      volunteers: "Volunteers Operations Console",
      settings: "AI Model Config Parameters"
    };
    elements.tabBreadcrumb.textContent = breadcrumbLabels[tabId] || "Command Center";
  }
};

// Exposed window handler for tab routing
window.switchTab = function(tabId) {
  TabManager.switch(tabId);
};

// ==========================================
// 3. OPERATIONS TWIN (Stadium SVG Mapping)
// ==========================================
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

// Exposed window handler for map hotspots
window.inspectHotspot = function(zoneName) {
  OperationsMap.inspect(zoneName);
};

// ==========================================
// 4. COOPERATIVE AI SOLVER (Agent debates & checklists)
// ==========================================
const AgentSolver = {
  debate(scenario) {
    elements.agentDebateFeed.innerHTML = "";
    elements.executeActionsBtn.disabled = true;
    state.activeIncident = scenario;

    this.renderChecklist(scenario.actionPlan);

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
        elements.actionsCounter.textContent = `0 / 0`;
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

// ==========================================
// 5. CCTV MULTIMODAL SCANNER (Vision model ingestion)
// ==========================================
const CCTVScanner = {
  populate() {
    elements.cctvFeedSelect.innerHTML = CCTV_FEEDS.map(feed => 
      `<option value="${escapeHTML(feed.id)}">${escapeHTML(feed.name)} (${escapeHTML(feed.location)})</option>`
    ).join("");
  },

  updatePreview(feedId) {
    const feed = CCTV_FEEDS.find(f => f.id === feedId);
    if (feed) {
      elements.cctvPreviewImage.src = feed.imageUrl;
      elements.cctvPreviewImage.alt = feed.name;
      elements.cctvResultContainer.classList.add("hidden");
      const placeholder = document.getElementById("cctv-result-container-placeholder");
      if (placeholder) placeholder.classList.remove("hidden");
    }
  },

  async scan() {
    const feedId = elements.cctvFeedSelect.value;
    const feed = CCTV_FEEDS.find(f => f.id === feedId);
    if (!feed) return;

    CommandTerminal.log(`Initiating Gemini CV scanning on ${feed.name}...`, "info");
    
    elements.cctvAnalyzeBtn.disabled = true;
    elements.cctvAnalyzeBtn.textContent = "Scanning feed...";
    elements.cctvResultContainer.classList.add("hidden");
    
    const placeholder = document.getElementById("cctv-result-container-placeholder");
    if (placeholder) placeholder.classList.add("hidden");

    await new Promise(resolve => setTimeout(resolve, 2000));

    let results = null;

    if (state.apiConfig.mode === "live" && state.apiConfig.apiKey) {
      try {
        results = await this.fetchLiveAPI(feed);
      } catch (err) {
        console.error(err);
        CommandTerminal.log(`Gemini API Call failed: ${err.message}. Falling back to high-fidelity local simulator.`, "error");
        results = feed.analysisFallback;
      }
    } else {
      results = feed.analysisFallback;
    }

    this.display(results, feed);
  },

  async fetchLiveAPI(feed) {
    const model = state.apiConfig.model;
    const apiKey = state.apiConfig.apiKey;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const textPrompt = `Analyze this CCTV stream feed from location: ${feed.location} (${feed.description}). Identify any turnstile failures, bottlenecks, physical safety hazards, or heat stroke indicators. Respond in STRICT JSON matching this schema:
    {
      "timestamp": "ISO8601 String",
      "threatLevel": "GREEN | AMBER | RED",
      "analysisSummary": "A clear, 2-3 sentence technical summary of the situation.",
      "detectedElements": [
        {
          "name": "Description of object/situation (e.g. Broken turnstile)",
          "confidence": 0.0-1.0,
          "coordinates": [x, y]
        }
      ],
      "recommendedActions": [
        "Action item 1",
        "Action item 2"
      ]
    }`;

    let inlineData = null;
    try {
      const response = await fetch(feed.imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      inlineData = {
        mimeType: blob.type || "image/jpeg",
        data: base64
      };
    } catch (corsErr) {
      console.warn("Multimodal image fetch blocked by CORS. Sending text context representation of the CCTV view instead.", corsErr);
    }

    const contents = [{
      parts: [
        { text: textPrompt }
      ]
    }];

    if (inlineData) {
      contents[0].parts.unshift({
        inlineData: inlineData
      });
    } else {
      contents[0].parts.push({
        text: `Context Information about image feed: Location is ${feed.location}. Context description: ${feed.description}. Thumbnail shows crowd packing, security personnel standing near barriers, and a visual overlay of coordinates.`
      });
    }

    const payload = {
      contents: contents,
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
  },

  display(results, feed) {
    elements.cctvAnalyzeBtn.disabled = false;
    elements.cctvAnalyzeBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> Analyze Feed with Gemini`;
    lucide.createIcons();

    elements.cvThreatBadge.textContent = results.threatLevel;
    elements.cvThreatBadge.className = "text-[10px] px-2.5 py-0.5 rounded-full font-bold";
    if (results.threatLevel === "RED") {
      elements.cvThreatBadge.classList.add("bg-red-500/20", "text-red-400");
    } else if (results.threatLevel === "AMBER") {
      elements.cvThreatBadge.classList.add("bg-amber-500/20", "text-amber-400");
    } else {
      elements.cvThreatBadge.classList.add("bg-emerald-500/20", "text-emerald-400");
    }

    elements.cvAnalysisSummary.textContent = results.analysisSummary;

    // Sanitize element names dynamically
    elements.cvHotspots.innerHTML = results.detectedElements.map(el => `
      <div class="p-1.5 bg-gray-950/80 rounded border border-[rgba(255,255,255,0.04)] text-[9px] flex items-center justify-between">
        <span class="text-gray-300 font-medium truncate w-[70%]">${escapeHTML(el.name)}</span>
        <span class="text-cyan-400 font-mono">${(el.confidence * 100).toFixed(0)}%</span>
      </div>
    `).join("");

    elements.cctvResultContainer.classList.remove("hidden");
    CommandTerminal.log(`Gemini CCTV scan returned threat state: ${results.threatLevel}`, results.threatLevel === "RED" ? "error" : "warning");

    if (results.threatLevel === "RED" || results.threatLevel === "AMBER") {
      let mockScenarioId = "scenario-gate-bottleneck";
      if (feed.id === "feed-transit-hub") mockScenarioId = "scenario-transit-suspension";
      if (feed.id === "feed-concession-b") mockScenarioId = "scenario-sustainability"; // Route waste hub overflow
      if (feed.id === "feed-gate-d-elevator") mockScenarioId = "scenario-accessibility"; // Route elevator to ADA lift failure

      setTimeout(() => {
        window.triggerScenario(mockScenarioId);
      }, 1500);
    }
  }
};

// ==========================================
// 6. COMMANDER CONSOLE (CLI Natural Language parser)
// ==========================================
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
    // Strict escape of CLI outputs to prevent injection attacks
    div.textContent = `> ${escapeHTML(message)}`;
    elements.consoleChatLog.appendChild(div);
    elements.consoleChatLog.scrollTop = elements.consoleChatLog.scrollHeight;
  },

  async process(commandText) {
    // Validate command input parameters (prevent script parameters injection)
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

// Global App Initialization
function init() {
  ConfigManager.load();
  CCTVScanner.populate();
  
  // Initialize clock
  const updateTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    elements.cctvTime.textContent = `UTC: ${now.toISOString().substring(0,10)} | ${timeStr}`;
  };
  updateTime();
  setInterval(updateTime, 1000);
  
  // Bind listeners
  elements.cctvFeedSelect.addEventListener("change", (e) => {
    CCTVScanner.updatePreview(e.target.value);
  });

  elements.cctvAnalyzeBtn.addEventListener("click", () => {
    CCTVScanner.scan();
  });

  elements.commanderConsoleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cmd = elements.consoleCommandInput.value;
    CommandTerminal.process(cmd);
    elements.consoleCommandInput.value = "";
  });

  elements.aiModeToggle.addEventListener("change", (e) => {
    ConfigManager.toggleVisibility(e.target.value);
  });

  elements.saveConfigBtn.addEventListener("click", () => {
    ConfigManager.save();
  });

  elements.executeActionsBtn.addEventListener("click", () => {
    AgentSolver.execute();
  });

  OperationsMap.render();
  
  if (CCTV_FEEDS.length > 0) {
    CCTVScanner.updatePreview(CCTV_FEEDS[0].id);
  }
}
