/**
 * SentinelOS - App Bootloader (Main Glue Script)
 * Coordinates lifecycle boot initialization and connects visual DOM hooks
 * to respective modular subsystems (Config, Tabs, Map, Solver, Scanner, Terminal).
 */

// Application Boot Sequence
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  // Re-lookup DOM elements in case they were not fully bound
  elements.systemStatusPill = document.getElementById("system-status-pill");
  elements.cctvFeedSelect = document.getElementById("cctv-feed-select");
  elements.cctvPreviewImage = document.getElementById("cctv-preview-image");
  elements.cctvTime = document.getElementById("cctv-time");
  elements.cctvAnalyzeBtn = document.getElementById("cctv-analyze-btn");
  elements.cctvResultContainer = document.getElementById("cctv-result-container");
  elements.cvThreatBadge = document.getElementById("cv-threat-badge");
  elements.cvAnalysisSummary = document.getElementById("cv-analysis-summary");
  elements.cvHotspots = document.getElementById("cv-hotspots");
  elements.consoleChatLog = document.getElementById("console-chat-log");
  elements.commanderConsoleForm = document.getElementById("commander-console-form");
  elements.consoleCommandInput = document.getElementById("console-command-input");
  elements.agentDebateFeed = document.getElementById("agent-debate-feed");
  elements.actionsCounter = document.getElementById("actions-counter");
  elements.actionsChecklist = document.getElementById("actions-checklist");
  elements.executeActionsBtn = document.getElementById("execute-actions-btn");
  elements.aiModeToggle = document.getElementById("ai-mode-toggle");
  elements.apiKeyContainer = document.getElementById("api-key-container");
  elements.geminiApiKey = document.getElementById("gemini-api-key");
  elements.geminiModelSelect = document.getElementById("gemini-model-select");
  elements.saveConfigBtn = document.getElementById("save-config-btn");
  elements.tabBreadcrumb = document.getElementById("tab-breadcrumb");

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
