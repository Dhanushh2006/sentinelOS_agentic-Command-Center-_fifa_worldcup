/**
 * SentinelOS - Global State & Utilities Registry
 * Declares core shared variables and escaping helpers loaded first.
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
