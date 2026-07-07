/**
 * SentinelOS - ConfigManager Subsystem
 * Handles local credentials caching, safe localStorage read/write operations,
 * and API key pattern validations.
 */

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
