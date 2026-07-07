# Prompt Engineering & System Orchestration Documentation

This document outlines the prompt engineering methodology, design patterns, and orchestration systems utilized in **SentinelOS**. 

---

## 1. System Prompt Architecture

To achieve precise, structured, and hallucination-free decision support, SentinelOS divides responsibilities among multiple localized agents rather than using a single generic chatbot prompt.

### A. Computer Vision CCTV Analyzer Prompt
- **Role**: Extracts structured event arrays from image frames.
- **Model Target**: Gemini 2.5 Flash / Gemini 1.5 Flash (Multimodal)
- **System Instruction**:
  ```text
  You are the SentinelOS Multimodal Computer Vision Agent, a core safety system for the FIFA World Cup 2026. Your role is to inspect CCTV video frames or aerial drone photos of stadium zones to identify potential hazards, crowd bottlenecks, medical emergencies, traffic jams, and security risks. You must be precise, realistic, and objective.
  ```
- **Context Template**:
  ```text
  Analyze this CCTV stream image from location: {location} ({description}). Identify any turnstile failures, gridlocks, physical safety hazards, or heat exhaustion signs. Respond in STRICT JSON matching this schema:
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
  }
  ```

---

## 2. Multi-Agent Negotiation Architecture (Cooperative Solver)

SentinelOS uses a **Multi-Agent Simulation** where specialized operational agents deliberate sequentially to generate a synthesized action plan.

### A. Common Dialogue Constraints
```text
You are participating in a multi-agent operational debate for stadium incident resolution. Maintain role boundaries. Do not invent details outside the scenario. Collaborate to find an optimal solution. Keep responses under 3 sentences, highly focused on resources, safety, and coordinate actions.
```

### B. Agent Personas (Role Prompting)

1. **OpsAgent (Operations Coordinator)**
   - **Goal**: General logistics, volunteer deployment, technician dispatch, resource allocation (bottled water, temporary shelters, auxiliary turnstiles).
   - **Priority**: Operational efficiency, staff readiness, equipment recovery.
   - **Avatar**: `👷`

2. **CrowdAgent (Crowd & Safety Specialist)**
   - **Goal**: Ingress/egress throughput, pedestrian spacing, physical queue barriers, perimeter security, preventing crushing.
   - **Priority**: Safe crowd density levels, exit lane clearance, routing signage.
   - **Avatar**: `👮`

3. **TransitAgent (Transport Coordinator)**
   - **Goal**: Interfaces with city bus depots, train networks (NJ Transit), shuttle bus dispatchers, parking lot systems.
   - **Priority**: Egress evacuation throughput, vehicle dispatch, traffic flow.
   - **Avatar**: `🚌`

4. **RescueAgent (Medical & Emergency Coordinator)**
   - **Goal**: Deploys medical carts, establishes hydration zones, coordinates EMT patrols, interfaces with local Fire/Hazmat teams.
   - **Priority**: Medical treatment response times, fire containment, cooling stress mitigation.
   - **Avatar**: `🏥`

---

## 3. High-Level Chain-of-Thought Strategy

When a crisis scenario is triggered:
1. **Assessment Phase**: `CrowdAgent` reads the incident parameters (location, severity, details) and estimates density/safety risk.
2. **Medical Check**: `RescueAgent` reviews health or hazard impacts (e.g. extreme heat, smoke) and allocates medical units.
3. **Logistics Provisioning**: `OpsAgent` checks physical assets (volunteers, manual turnstiles, hydration water).
4. **Transport Alignment**: `TransitAgent` adjusts train schedules, dispatches emergency buses, and reroutes traffic lanes.
5. **Synthesis**: The agents compile and prioritize their actions into a unified checklist presented to the Commander for approval.

---

## 4. Hallucination Mitigation & Output Validation

- **Structured Output Constraints**: We force Gemini to output in strict JSON syntax using `responseMimeType: "application/json"`.
- **CORS/Network Fallbacks**: If the user lacks an API key or is experiencing CORS issues, SentinelOS deploys high-fidelity local simulator data to ensure the client dashboard never crashes or returns empty data.
- **Safety Filters**: SentinelOS limits the generation parameters to avoid generating panic-inducing language. It remains technical, cold, and logistical in all scenario resolutions.
