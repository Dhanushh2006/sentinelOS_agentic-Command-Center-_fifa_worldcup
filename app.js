/**
 * SentinelOS - Core Operation & Decision Intelligence System
 * Coordinates UI rendering, stadium state machine, multi-agent negotiation simulations,
 * and integration with the Google Gemini API.
 */

// Application State
const state = {
  activeIncident: null,
  dialogueHistory: [],
  consoleHistory: [],
  apiConfig: {
    mode: "simulated", // "simulated" | "live"
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

// DOM Elements
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
  configModal: document.getElementById("config-modal"),
  openConfigBtn: document.getElementById("open-config-btn"),
  closeConfigBtn: document.getElementById("close-config-btn"),
  saveConfigBtn: document.getElementById("save-config-btn"),
  aiModeToggle: document.getElementById("ai-mode-toggle"),
  apiKeyContainer: document.getElementById("api-key-container"),
  geminiApiKey: document.getElementById("gemini-api-key"),
  geminiModelSelect: document.getElementById("gemini-model-select")
};

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  loadConfig();
  populateCCTVFeeds();
  updateClock();
  setInterval(updateClock, 1000);
  bindEvents();
  renderStadiumMap();
  
  // Set initial preview
  if (CCTV_FEEDS.length > 0) {
    updateCCTVPreview(CCTV_FEEDS[0].id);
  }
}

// Bind User Actions & Listeners
function bindEvents() {
  // CCTV Selection Change
  elements.cctvFeedSelect.addEventListener("change", (e) => {
    updateCCTVPreview(e.target.value);
  });

  // CCTV Analyze Button
  elements.cctvAnalyzeBtn.addEventListener("click", () => {
    analyzeCCTVFeed();
  });

  // Console Command Submission
  elements.commanderConsoleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const command = elements.consoleCommandInput.value.trim();
    if (command) {
      processConsoleCommand(command);
      elements.consoleCommandInput.value = "";
    }
  });

  // Settings Modal Controls
  elements.openConfigBtn.addEventListener("click", () => {
    elements.configModal.showModal();
  });

  elements.closeConfigBtn.addEventListener("click", () => {
    elements.configModal.close();
  });

  elements.aiModeToggle.addEventListener("change", (e) => {
    toggleAPIKeyVisibility(e.target.value);
  });

  elements.saveConfigBtn.addEventListener("click", () => {
    saveConfig();
    elements.configModal.close();
  });

  // Execute Action Plan
  elements.executeActionsBtn.addEventListener("click", () => {
    executeResolvingPlan();
  });
}

// Clock updates
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  elements.cctvTime.textContent = `UTC: ${now.toISOString().substring(0,10)} | ${timeStr}`;
}

// Load configurations from LocalStorage
function loadConfig() {
  const savedMode = localStorage.getItem("sentinel_mode");
  const savedKey = localStorage.getItem("sentinel_key");
  const savedModel = localStorage.getItem("sentinel_model");

  if (savedMode) state.apiConfig.mode = savedMode;
  if (savedKey) state.apiConfig.apiKey = savedKey;
  if (savedModel) state.apiConfig.model = savedModel;

  // Set values in UI elements
  elements.aiModeToggle.value = state.apiConfig.mode;
  elements.geminiApiKey.value = state.apiConfig.apiKey;
  elements.geminiModelSelect.value = state.apiConfig.model;

  toggleAPIKeyVisibility(state.apiConfig.mode);
}

// Toggle Visibility of API key input field
function toggleAPIKeyVisibility(mode) {
  if (mode === "live") {
    elements.apiKeyContainer.classList.remove("hidden");
  } else {
    elements.apiKeyContainer.classList.add("hidden");
  }
}

// Save Settings
function saveConfig() {
  state.apiConfig.mode = elements.aiModeToggle.value;
  state.apiConfig.apiKey = elements.geminiApiKey.value.trim();
  state.apiConfig.model = elements.geminiModelSelect.value;

  localStorage.setItem("sentinel_mode", state.apiConfig.mode);
  localStorage.setItem("sentinel_key", state.apiConfig.apiKey);
  localStorage.setItem("sentinel_model", state.apiConfig.model);

  logToConsole(`System: Configuration updated. Mode = ${state.apiConfig.mode.toUpperCase()}`);
}

// Populating CCTV Dropdown lists
function populateCCTVFeeds() {
  elements.cctvFeedSelect.innerHTML = CCTV_FEEDS.map(feed => 
    `<option value="${feed.id}">${feed.name} (${feed.location})</option>`
  ).join("");
}

// Update CCTV Image Preview
function updateCCTVPreview(feedId) {
  const feed = CCTV_FEEDS.find(f => f.id === feedId);
  if (feed) {
    elements.cctvPreviewImage.src = feed.imageUrl;
    elements.cctvPreviewImage.alt = feed.name;
    // Reset CV results panels
    elements.cctvResultContainer.classList.add("hidden");
  }
}

// Log actions in Commander Terminal console
function logToConsole(message, type = "info") {
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
  div.textContent = `> ${message}`;
  elements.consoleChatLog.appendChild(div);
  elements.consoleChatLog.scrollTop = elements.consoleChatLog.scrollHeight;
}

// Render dynamic twin map visual nodes based on status
function renderStadiumMap() {
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

  // Calculate overall stadium health
  let redCount = 0;
  let amberCount = 0;
  Object.values(state.stadiumState).forEach(status => {
    if (status === "RED") redCount++;
    if (status === "AMBER") amberCount++;
  });

  if (redCount > 0) {
    elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold";
    elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-400 animate-ping"></span><span>${redCount} CRITICAL INCIDENTS DETECTED</span>`;
  } else if (amberCount > 0) {
    elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold";
    elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span>${amberCount} ZONE WARNINGS ACTIVE</span>`;
  } else {
    elements.systemStatusPill.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold";
    elements.systemStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>SYSTEM HEALTHY</span>`;
  }
}

// Hotspot Manual Inspection Click Handler
function inspectHotspot(zoneName) {
  const currentStatus = state.stadiumState[zoneName] || "GREEN";
  logToConsole(`Inspecting ${zoneName}...`, "info");
  
  setTimeout(() => {
    if (currentStatus === "GREEN") {
      logToConsole(`${zoneName} Status: CLEAR. No operational bottlenecks detected. Ingress/egress ratios standard.`, "success");
    } else if (currentStatus === "AMBER") {
      logToConsole(`${zoneName} Status: WARNING. Elevated density levels or system lag detected. Reviewing resolution actions.`, "warning");
    } else {
      logToConsole(`${zoneName} Status: CRITICAL. Incidents active. Multi-agent solver engaged. Immediate response required.`, "error");
    }
  }, 400);
}

// Simulate Gemini Multi-Agent Debate flow
function runAgentDebate(scenario) {
  elements.agentDebateFeed.innerHTML = "";
  elements.executeActionsBtn.disabled = true;
  state.activeIncident = scenario;

  // Render Action Plan header as pending
  renderActionPlan(scenario.actionPlan);

  let step = 0;
  const debate = scenario.debate;

  function nextDebateSpeech() {
    if (step >= debate.length) {
      // Completed negotiation debate
      elements.executeActionsBtn.disabled = false;
      logToConsole(`Agents Synthesized Resolution Plan. Ready for Commander execution.`, "warning");
      return;
    }

    const item = debate[step];
    
    // Add typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "p-3 bg-gray-900/40 rounded-xl flex items-center gap-1.5 text-xs text-gray-500 mb-2 border border-dashed border-[rgba(255,255,255,0.05)]";
    typingIndicator.id = `typing-${item.agent}`;
    typingIndicator.innerHTML = `<span>${item.agent} is deliberating</span> <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    elements.agentDebateFeed.appendChild(typingIndicator);
    elements.agentDebateFeed.scrollTop = elements.agentDebateFeed.scrollHeight;

    setTimeout(() => {
      // Remove typing indicator
      const tip = document.getElementById(`typing-${item.agent}`);
      if (tip) tip.remove();

      // Append real message
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
          <span class="font-bold flex items-center gap-1 text-[11px] ${item.color}">${item.avatar} ${item.agent.toUpperCase()}</span>
          <span class="text-[8px] text-gray-500 font-mono">CoT Reasoner</span>
        </div>
        <p class="text-gray-200 text-xs leading-relaxed">${item.message}</p>
      `;
      elements.agentDebateFeed.appendChild(msgDiv);
      elements.agentDebateFeed.scrollTop = elements.agentDebateFeed.scrollHeight;

      step++;
      // Auto-schedule next step in debate
      setTimeout(nextDebateSpeech, 1800);
    }, 1500); // Deliberation delay
  }

  // Start debate
  nextDebateSpeech();
}

// Render Actions Checklist
function renderActionPlan(plan) {
  elements.actionsCounter.textContent = `0 / ${plan.length}`;
  elements.actionsChecklist.innerHTML = plan.map(action => `
    <div class="flex items-center gap-2.5 p-2 bg-gray-900/50 rounded-lg border border-[rgba(255,255,255,0.05)] text-xs" id="item-${action.id}">
      <input type="checkbox" id="check-${action.id}" disabled class="rounded border-gray-700 bg-gray-950 text-purple-500 focus:ring-0">
      <label for="check-${action.id}" class="text-gray-300 font-light flex-1">${action.text}</label>
      <span class="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">${action.owner}</span>
    </div>
  `).join("");
}

// Trigger Scenario Handler
function triggerScenario(scenarioId) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  logToConsole(`COMMAND: Manual scenario trigger initiated: ${scenario.title}`, "warning");
  
  // Set stadium states based on incident location
  Object.keys(state.stadiumState).forEach(zone => {
    state.stadiumState[zone] = "GREEN"; // Reset first
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

  renderStadiumMap();
  runAgentDebate(scenario);
}

// Deploy Actions Plan - complete operations and clear warnings
function executeResolvingPlan() {
  if (!state.activeIncident) return;
  
  elements.executeActionsBtn.disabled = true;
  logToConsole(`Deploying synthesized operations response script...`, "warning");

  const plan = state.activeIncident.actionPlan;
  let idx = 0;

  function checkNext() {
    if (idx >= plan.length) {
      // Completed all actions
      logToConsole(`SUCCESS: All operational actions deployed and resolved. Stadium status stabilized.`, "success");
      
      // Reset state to Green
      Object.keys(state.stadiumState).forEach(zone => {
        state.stadiumState[zone] = "GREEN";
      });
      renderStadiumMap();
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
      logToConsole(`Action Executed: [${action.owner}] ${action.text}`, "success");
      elements.actionsCounter.textContent = `${idx + 1} / ${plan.length}`;
    }

    idx++;
    setTimeout(checkNext, 1200);
  }

  checkNext();
}

// Call Google Gemini API directly or fall back to high-fidelity simulator
async function analyzeCCTVFeed() {
  const feedId = elements.cctvFeedSelect.value;
  const feed = CCTV_FEEDS.find(f => f.id === feedId);
  if (!feed) return;

  logToConsole(`Initiating Gemini CV scanning on ${feed.name}...`, "info");
  
  // Show spinner / skeletons
  elements.cctvAnalyzeBtn.disabled = true;
  elements.cctvAnalyzeBtn.innerHTML = `<span class="animate-spin mr-2">&#9696;</span> Scanning feed...`;
  elements.cctvResultContainer.classList.add("hidden");

  // Local delays to simulate visual ingestion
  await new Promise(resolve => setTimeout(resolve, 2000));

  let results = null;

  if (state.apiConfig.mode === "live" && state.apiConfig.apiKey) {
    try {
      results = await fetchLiveGeminiCVAnalysis(feed);
    } catch (err) {
      console.error(err);
      logToConsole(`Gemini API Call failed: ${err.message}. Falling back to high-fidelity local models.`, "error");
      results = feed.analysisFallback;
    }
  } else {
    // Simulator Mode
    results = feed.analysisFallback;
  }

  // Display results
  displayCCTVResults(results, feed);
}

// Direct fetch calls to the Gemini REST API
async function fetchLiveGeminiCVAnalysis(feed) {
  const model = state.apiConfig.model;
  const apiKey = state.apiConfig.apiKey;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build the textual context prompt based on the template
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

  // Since we are running in a client-side environment and fetching remote URL,
  // we will pass the prompt with instructions to simulate the vision capabilities of Gemini 2.5/1.5.
  // In a full production build, we would convert the CCTV image URL into base64 and attach it as inline_data.
  // Let's implement actual inline_data converting the image URL to base64 if possible, or fetch text-first.
  // For the hackathon demonstration, we download the image and send it as a multimodal payload!
  // To avoid CORS issues, we download through a client side canvas or a fetch fallback.
  // If CORS blocks the fetch, we use text-with-image description fallback.
  
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
    // If CORS blocked the canvas convert, add context information textually so Gemini can still respond logically
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
}

// Display the parsed CCTV Results
function displayCCTVResults(results, feed) {
  elements.cctvAnalyzeBtn.disabled = false;
  elements.cctvAnalyzeBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> Analyze Feed with Gemini`;

  // Populate data
  elements.cvThreatBadge.textContent = results.threatLevel;
  elements.cvThreatBadge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold `;
  if (results.threatLevel === "RED") elements.cvThreatBadge.classList.add("bg-red-500/20", "text-red-400");
  else if (results.threatLevel === "AMBER") elements.cvThreatBadge.classList.add("bg-amber-500/20", "text-amber-400");
  else elements.cvThreatBadge.classList.add("bg-emerald-500/20", "text-emerald-400");

  elements.cvAnalysisSummary.textContent = results.analysisSummary;

  elements.cvHotspots.innerHTML = results.detectedElements.map(el => `
    <div class="p-1.5 bg-gray-950/80 rounded border border-[rgba(255,255,255,0.04)] text-[10px] flex items-center justify-between">
      <span class="text-gray-300 font-medium truncate w-[75%]">${el.name}</span>
      <span class="text-cyan-400 font-mono">${(el.confidence * 100).toFixed(0)}%</span>
    </div>
  `).join("");

  elements.cctvResultContainer.classList.remove("hidden");
  logToConsole(`Gemini CCTV scan returned threat state: ${results.threatLevel}`, results.threatLevel === "RED" ? "error" : "warning");

  // Automatically trigger a response scenario debate based on CCTV detections!
  if (results.threatLevel === "RED" || results.threatLevel === "AMBER") {
    // Map feed locations to pre-existing scenarios for full visual display
    let mockScenarioId = "scenario-gate-bottleneck";
    if (feed.id === "feed-transit-hub") mockScenarioId = "scenario-transit-suspension";
    if (feed.id === "feed-concession-b") mockScenarioId = "scenario-fire-hazard"; // close approximation
    if (feed.id === "feed-gate-d-elevator") mockScenarioId = "scenario-gate-bottleneck"; // redirecting to Gate D

    setTimeout(() => {
      triggerScenario(mockScenarioId);
    }, 1500);
  }
}

// Process Commander Console input using Regex/Simple Local Compiler or Live Gemini Parser
async function processConsoleCommand(commandText) {
  logToConsole(`Commander CMD: "${commandText}"`, "success");

  // Local parser logic
  let understood = "Unidentified Command";
  let target = "general";
  let responseMsg = "Instruction acknowledged. Processing general stadium directives.";
  let recommendations = ["Review active incident desks", "Inspect specific gate nodes"];

  // Normalize Command for parsing
  const cmd = commandText.toLowerCase();

  if (cmd.includes("medical") || cmd.includes("rescue") || cmd.includes("cooling") || cmd.includes("heat")) {
    understood = "Dispatch Emergency Medical Resources";
    target = "medical";
    responseMsg = "Dispatched emergency cooling volunteers and a mobile medical responder to the requested coordinates.";
    recommendations = ["Monitor victim heat stroke logs", "Check water inventory at adjacent plazas"];
  } 
  else if (cmd.includes("transit") || cmd.includes("shuttle") || cmd.includes("bus") || cmd.includes("train")) {
    understood = "Adjust Transit Egress Routes";
    target = "transit";
    responseMsg = "Rerouting shuttle buses to alternative drop points. Communication with local rail authorities established.";
    recommendations = ["Inform crowd managers of transit capacity changes", "Update external signs"];
  } 
  else if (cmd.includes("scanner") || cmd.includes("gate") || cmd.includes("turnstile")) {
    understood = "Deploy Scanner Technicians";
    target = "maintenance";
    responseMsg = "Dispatched IT support technicians to the turnstile terminals. Manual scanning apps authorized.";
    recommendations = ["Direct volunteers to distribute bottled water to waiting queues"];
  } 
  else if (cmd.includes("clear") || cmd.includes("resolve") || cmd.includes("green")) {
    understood = "Reset Stadium Alarm Systems";
    target = "general";
    responseMsg = "System health check initiated. Restoring all zones to Green status.";
    recommendations = ["Continue monitoring gate sensors"];
    
    // Trigger reset
    Object.keys(state.stadiumState).forEach(zone => {
      state.stadiumState[zone] = "GREEN";
    });
    renderStadiumMap();
    if (state.activeIncident) {
      state.activeIncident = null;
      elements.actionsChecklist.innerHTML = `<p class="text-xs text-gray-500 italic">Clear command issued. System idle.</p>`;
      elements.actionsCounter.textContent = `0 / 0`;
      elements.executeActionsBtn.disabled = true;
      elements.agentDebateFeed.innerHTML = `<div class="text-gray-400 italic text-center py-6">Operational clearance. Monitoring active...</div>`;
    }
  }

  // Display compiler feedback in console logs
  setTimeout(() => {
    logToConsole(`Parser Match: ${understood.toUpperCase()}`, "warning");
    logToConsole(`Dispatch: ${responseMsg}`, "info");
  }, 500);
}
