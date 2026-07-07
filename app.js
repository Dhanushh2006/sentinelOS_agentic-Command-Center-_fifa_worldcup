/**
 * SentinelOS - App Bootloader (Main Glue Script)
 * Coordinates lifecycle boot initialization and connects visual DOM hooks
 * to respective modular subsystems (Config, Tabs, Map, Solver, Scanner, Terminal).
 */

// Application State (Source of truth)
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

// Application Boot Sequence
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  // Load configuration parameters from secure vault cache
  ConfigManager.load();
  
  // Ingest camera stream dropdown profiles
  CCTVScanner.populate();
  
  // Launch system time tracker
  const updateTime = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    elements.cctvTime.textContent = `UTC: ${now.toISOString().substring(0,10)} | ${timeStr}`;
  };
  updateTime();
  setInterval(updateTime, 1000);
  
  // Render digital twin status mapping
  OperationsMap.render();
  
  // Bind UI listener hooks
  bindEvents();
  
  // Set default CCTV camera stream
  if (CCTV_FEEDS.length > 0) {
    CCTVScanner.updatePreview(CCTV_FEEDS[0].id);
  }
}

// Bind UI actions to subsystem methods
function bindEvents() {
  // CCTV Selection Change
  elements.cctvFeedSelect.addEventListener("change", (e) => {
    CCTVScanner.updatePreview(e.target.value);
  });

  // CCTV Ingestion Scan Trigger
  elements.cctvAnalyzeBtn.addEventListener("click", () => {
    CCTVScanner.scan();
  });

  // Console Prompt Submission
  elements.commanderConsoleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cmd = elements.consoleCommandInput.value;
    CommandTerminal.process(cmd);
    elements.consoleCommandInput.value = "";
  });

  // Settings Panel Config Listeners
  elements.aiModeToggle.addEventListener("change", (e) => {
    ConfigManager.toggleVisibility(e.target.value);
  });

  elements.saveConfigBtn.addEventListener("click", () => {
    ConfigManager.save();
  });

  // Deploy Action Plan Resolving script
  elements.executeActionsBtn.addEventListener("click", () => {
    AgentSolver.execute();
  });
}
