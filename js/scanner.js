/**
 * SentinelOS - CCTVScanner Subsystem
 * Coordinates camera feed directories, image thumbnail previews,
 * and direct calls to Google Gemini API endpoints.
 */

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
      if (feed.id === "feed-concession-b") mockScenarioId = "scenario-sustainability";
      if (feed.id === "feed-gate-d-elevator") mockScenarioId = "scenario-accessibility";

      setTimeout(() => {
        window.triggerScenario(mockScenarioId);
      }, 1500);
    }
  }
};
