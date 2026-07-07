# SentinelOS - Multi-Agent Stadium Operations Command Center

**SentinelOS** is an intelligent decision support and command console built for **FIFA World Cup 2026** stadium operations. It leverages multimodal computer vision and a cooperative multi-agent system powered by **Google Gemini** to proactively detect, analyze, and coordinate resolutions for operational crises (crowd bottlenecks, transit failures, medical emergencies, safety hazards).

---

## 🚀 Key Features

1. **Digital Twin Stadium Map**: A custom-designed SVG stadium floor plan showing live status coordinates (Gates, Transit Plaza, Concourse sectors) that pulse dynamically based on active threat states (Green, Amber, Red).
2. **Gemini CV CCTV Monitor**: A multimodal module that simulates live CCTV camera streams. Operators can analyze feeds with Gemini to automatically detect turnstile failures, crowd bottlenecks, safety hazards, and thermal medical distress.
3. **Cooperative Multi-Agent Solver**: A network of four specialized AI agents that deliberate in real time using Chain-of-Thought (CoT) reasoning:
   - 👷 **OpsAgent**: Coordinates logistics, volunteers, and facilities.
   - 👮 **CrowdAgent**: Manages queue routing, density thresholds, and barrier placement.
   - 🚌 **TransitAgent**: Controls shuttle bus routing and coordinates with rail authorities.
   - 🏥 **RescueAgent**: Dispatches EMTs, medical carts, cooling tents, and coordinates fire response.
4. **Natural Language Console**: An interactive terminal enabling commanders to type plain-text directives (e.g. *"dispatch cooling volunteers to Gate D"*) which are translated into structured state updates.
5. **Automated Testing suite**: A built-in QA visual testing rig (`test_suite.html`) verifying unit logic, integration flows, and WCAG 2.2 accessibility metrics.

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla ES6+ JavaScript, CSS3
- **CSS utility Framework**: TailwindCSS (loaded via CDN)
- **Icons**: Lucide Icons
- **AI Integration**: Google Gemini Developer API (fetch-based REST wrapper supporting both User API Keys and high-fidelity local simulator fallbacks)
- **Local Web Server**: Python 3's built-in HTTP server (`python -m http.server`)

---

## 📂 Folder Structure

```text
C:\Users\yathi\OneDrive\Documents\Google for developers hackathon\
├── index.html                 # Main Dashboard Application Interface
├── styles.css                 # Glassmorphic MD3 Styling & Animations
├── app.js                     # State Machine, Map Controls, and Gemini Client API
├── mockData.js                # Simulated FIFA 2026 Incidents and Fallback Responses
├── prompt_templates.json      # Structured System Instructions & Prompts
├── test_suite.html            # Visual QA Runner & Accessibility Checker
├── prompt_engineering.md      # Detailed documentation of Prompts & Multi-Agent logic
└── README.md                  # Comprehensive Documentation
```

---

## ⚡ Setup & Run

No compilation, bundlers, or npm package downloads are required, guaranteeing 100% execution success on any machine.

1. Open a terminal in this workspace folder.
2. Launch Python's lightweight web server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)
4. Click the **Launch Live QA Test Suite** link in the footer to run automated assertions, or click the **Settings** icon to input a Google Gemini API Key and toggle Live mode.
