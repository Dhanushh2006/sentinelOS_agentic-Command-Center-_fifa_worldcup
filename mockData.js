/**
 * SentinelOS - Mock Data & Scenario Simulator Engine
 * Contains realistic data structures for FIFA 2026 Stadium Operations,
 * including CCTV feeds, pre-configured crisis scenarios, and high-fidelity
 * agent negotiation fallbacks.
 */

const CCTV_FEEDS = [
  {
    id: "feed-gate-a",
    name: "CCTV - Gate A Ingress",
    location: "Main Entrance North",
    description: "Camera feed overlooking the main ticket-scanning turnstiles at Gate A.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", // Stadium crowd
    analysisFallback: {
      timestamp: new Date().toISOString(),
      threatLevel: "AMBER",
      analysisSummary: "Turnstile bottleneck detected at Gate A. 5 out of 12 ticket scanners are currently unresponsive. Average queue wait time has increased from 4 minutes to 22 minutes. Crowd density is at 3.2 people/m² in the holding pen, which exceeds the safe threshold of 2.5 people/m².",
      detectedElements: [
        { name: "Unresponsive turnstiles", confidence: 0.94, coordinates: [230, 450] },
        { name: "High crowd density cluster", confidence: 0.91, coordinates: [510, 320] },
        { name: "Fans climbing safety barriers", confidence: 0.88, coordinates: [120, 640] }
      ],
      recommendedActions: [
        "Transition ticket scanning to manual mobile scanners immediately.",
        "Reroute incoming fans from North Transit Hub to Gate B (7-minute walk).",
        "Deploy Crowd safety teams to establish buffer lines and prevent surging."
      ]
    }
  },
  {
    id: "feed-transit-hub",
    name: "CCTV - Transit Terminal 2",
    location: "Metro Rail Exit & Shuttle Bay",
    description: "Thermal and visual feed monitoring the pedestrian ramp connecting Metro Terminal to the stadium concourse.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80", // Crowded esports/stadium entrance
    analysisFallback: {
      timestamp: new Date().toISOString(),
      threatLevel: "RED",
      analysisSummary: "Pedestrian gridlock detected at Metro Platform Ramp. A commuter rail delay has caused double-batching of incoming passenger trains. An estimated 8,500 fans are packed on a ramp designed for 4,000. Temperature sensor reads 39°C (102°F) on concrete, posing a severe heat-exhaustion hazard.",
      detectedElements: [
        { name: "Pedestrian gridlock", confidence: 0.98, coordinates: [300, 300] },
        { name: "Medical distress (heat exhaustion)", confidence: 0.85, coordinates: [720, 150] },
        { name: "Disabled access ramp blockage", confidence: 0.92, coordinates: [410, 480] }
      ],
      recommendedActions: [
        "Trigger transport hold at main depot: pause incoming trains for 10 minutes.",
        "Dispatch emergency cooling volunteers with hydration packs to the ramp.",
        "Activate physical access ramp bypass for wheelchair users."
      ]
    }
  },
  {
    id: "feed-gate-d-elevator",
    name: "CCTV - Gate D Elevator Lobby",
    location: "South Concourse Level 1",
    description: "High-angle camera showing elevator shafts and escalators leading to the upper deck.",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80", // Stadium interior stairs
    analysisFallback: {
      timestamp: new Date().toISOString(),
      threatLevel: "AMBER",
      analysisSummary: "Elevator #3 mechanical malfunction. A group of 14 mobility-impaired fans (including 4 wheelchair users) are stranded. A secondary crowd bottleneck is forming as ambulatory fans attempt to crowd the ADA ramps due to escalator slowdowns.",
      detectedElements: [
        { name: "Out-of-service Elevator #3", confidence: 0.99, coordinates: [180, 200] },
        { name: "Wheelchair queue cluster", confidence: 0.95, coordinates: [600, 500] },
        { name: "Escalator pedestrian bottleneck", confidence: 0.89, coordinates: [450, 320] }
      ],
      recommendedActions: [
        "Deploy Operations mobility team to escort wheelchair users to the Freight Elevator (2-minute transit).",
        "Instruct technician dispatcher to send elevator repair crew to Gate D.",
        "Adjust digital signage on concourse to direct ambulatory fans to the main stairwell."
      ]
    }
  },
  {
    id: "feed-concession-b",
    name: "CCTV - Concourse Plaza B",
    location: "East Plaza Concession Row",
    description: "Wide angle viewing food stalls and waste management recycling hubs.",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", // Outdoor venue
    analysisFallback: {
      timestamp: new Date().toISOString(),
      threatLevel: "GREEN",
      analysisSummary: "High waste accumulation detected at Waste Hubs 4 and 5. Discarded beverage cups and food wrappers have overflowed, creating a moderate slipping hazard. Pedestrian flow is normal, but safety risk will increase during half-time rush.",
      detectedElements: [
        { name: "Overflowing waste bins", confidence: 0.96, coordinates: [320, 550] },
        { name: "Debris slip hazard", confidence: 0.82, coordinates: [340, 580] }
      ],
      recommendedActions: [
        "Alert Sustainability / Waste Operations team to dispatch collection crew to Hubs 4 & 5.",
        "Deploy a mobile sweeper to clean up plastic cups.",
        "Adjust digital display boards nearby to direct fans to adjacent under-utilized Waste Hub 6."
      ]
    }
  }
];

const SCENARIOS = [
  {
    id: "scenario-gate-bottleneck",
    title: "Scenario A: Ticket Scanner Failure + Extreme Heat Wave",
    severity: "CRITICAL",
    category: "Crowd Safety & Health",
    description: "Gate D digital ticket scanners crash right during peak ingress. The temperature in East Rutherford is 38°C (100°F). Thousands of fans are packed in direct sunlight with no shade, leading to a spike in medical distress reports.",
    affectedArea: "Gate D (South-East Ingress)",
    hotspotId: "hotspot-gate-d",
    agents: ["OpsAgent", "CrowdAgent", "RescueAgent", "TransitAgent"],
    debate: [
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "ALERT: Ingress flow at Gate D has dropped to zero due to scanner crash. We have a crowd building up outside the gates. Density is approaching 3.5 people/m² in the perimeter. We must establish crowd holding points at the outer security ring to prevent surges, or we run the risk of localized crushes. Furthermore, fans are in direct sun."
      },
      {
        agent: "RescueAgent",
        avatar: "🏥",
        color: "text-red-400",
        message: "CRITICAL SUPPORT REQUIRED: Our thermal sensors and medical logs show a surge in heat exhaustion reports near Gate D. We have 4 active heat-stroke cases. We cannot hold fans in direct sun. I recommend dispatching a Mobile Medical Cart, erecting 3 pop-up shade tents, and immediately routing cooling volunteers carrying hydration sprayers and cold water bottles to the Gate D holding area."
      },
      {
        agent: "OpsAgent",
        avatar: "👷",
        color: "text-purple-400",
        message: "COORDINATING RESOLUTION: I am dispatching the IT Scanner Recovery Team to Gate D. In the meantime, I am authorizing the deploy of 15 volunteer units from the Central Concourse to Gate D with 100 cases of bottled water and mobile ticket validation apps (to manual scan tickets). I am also instructing Stadium Maintenance to open Gate E (adjacent auxiliary gate) to relieve crowd pressure."
      },
      {
        agent: "TransitAgent",
        avatar: "🚌",
        color: "text-amber-400",
        message: "TRANSPORT RESPONSE: Acknowledged. I am contacting NJ Transit and the shuttle bus dispatchers. We are slowing down shuttle arrivals at Terminal D drop-off and redirecting incoming fan buses to the North Transit Hub (Gate A). Digital signage at the train terminal is being updated to read: 'Gate D delayed. Please exit via Gate A/B for faster entry.'"
      },
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "UPDATE: Opening Auxiliary Gate E and redirecting transit shuttle drop-offs will reduce the incoming feed rate by 45%. We have set up barricade filters. Digital signage and volunteer bullhorns are instructing fans to have ticket QR codes ready on screens."
      },
      {
        agent: "RescueAgent",
        avatar: "🏥",
        color: "text-red-400",
        message: "UPDATE: Pop-up cooling tents are active. Mobile Medical Unit is on-site. We have treated 6 fans and stabilized the situation. Water bottle distribution is keeping hydration levels stable. Ready to support as manual scanning ramps up."
      },
      {
        agent: "OpsAgent",
        avatar: "👷",
        color: "text-purple-400",
        message: "FINAL PLAN SYNTHESIS: Manual ticket validation is live at Gate D and E. Flow rate is recovering. Security cordons are stable. Crisis mitigated. Closing incident loop."
      }
    ],
    actionPlan: [
      { id: "act-1", text: "Deploy IT turnstile recovery squad to Gate D.", status: "completed", owner: "OpsAgent" },
      { id: "act-2", text: "Erect 3 emergency cooling tents & deploy mobile medical cart.", status: "completed", owner: "RescueAgent" },
      { id: "act-3", text: "Dispatch 15 volunteer units with water bottles & manual scanners.", status: "completed", owner: "OpsAgent" },
      { id: "act-4", text: "Open Auxiliary Gate E to split the crowd.", status: "completed", owner: "CrowdAgent" },
      { id: "act-5", text: "Reroute shuttle drops to North Transit Terminal.", status: "completed", owner: "TransitAgent" }
    ]
  },
  {
    id: "scenario-transit-suspension",
    title: "Scenario B: Post-Match Transit Suspension",
    severity: "CRITICAL",
    category: "Transportation & Safety",
    description: "The main rail line linking MetLife Stadium to New York Penn Station suffers an electrical rail failure just as the match ends. 80,000 fans are exiting, and a massive bottleneck is forming at the Stadium Train Station entrance.",
    affectedArea: "North-West Transit Hub",
    hotspotId: "hotspot-transit",
    agents: ["TransitAgent", "CrowdAgent", "OpsAgent", "RescueAgent"],
    debate: [
      {
        agent: "TransitAgent",
        avatar: "🚌",
        color: "text-amber-400",
        message: "URGENT ALERT: NJ Transit train service is fully suspended due to catenary wire failure. Estimated repair time is 2 hours. We have 35,000 fans currently heading towards the station. We must immediately establish alternative transport vectors."
      },
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "CROWD SAFETY: Warning! If 35,000 fans pool in the Transit Plaza, we will reach critical density (4+ people/m²) within 15 minutes, leading to severe containment risks. We must implement holding patterns *inside* the stadium bowl and concourses. Keep fans inside using giant screens, live music, and stadium announcements to space out departures."
      },
      {
        agent: "OpsAgent",
        avatar: "👷",
        color: "text-purple-400",
        message: "OPERATIONAL DIRECTIVE: I am directing stadium control to keep concession stands open and offer a 20% discount on food/drinks to incentivize fans to stay. The stadium giant screen will display live concert feeds/post-game analysis. I am also calling in our multilingual announcers to broadcast the delay details in English, Spanish, and French, avoiding panic."
      },
      {
        agent: "TransitAgent",
        avatar: "🚌",
        color: "text-amber-400",
        message: "TRANSIT RESCUE WORKFLOW: I have activated our Emergency Shuttle Protocol. 65 diesel shuttle buses are being dispatched from the Secaucus Depot. I am coordinating with Uber/Lyft to surge rideshare vehicles to Rideshare Lot C, and lifting parking gate restrictions to allow personal vehicles to exit without toll gates slowing down traffic."
      },
      {
        agent: "RescueAgent",
        avatar: "🏥",
        color: "text-red-400",
        message: "MEDICAL PRECAUTION: Crowds waiting in holding areas will experience stress. I am deploying 8 foot-patrol medical teams to the Transit Plaza and Concourse exits, and setting up temporary hydration stations at Gate A."
      },
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "UPDATE: Internal holding gates are active. 60% of fans have remained in the stadium seating bowl to watch the post-game show. Transit plaza queue is stable and filtered by barricades."
      },
      {
        agent: "TransitAgent",
        avatar: "🚌",
        color: "text-amber-400",
        message: "UPDATE: First batch of 30 emergency shuttles has arrived and is boarding. Rideshare lane is flowing freely. NJ Transit estimates single track operation may resume in 40 minutes."
      }
    ],
    actionPlan: [
      { id: "t-act-1", text: "Initiate 'Stay & Play' post-match show on screens to retain fans.", status: "completed", owner: "OpsAgent" },
      { id: "t-act-2", text: "Deploy 65 emergency shuttles to Secaucus Terminal.", status: "completed", owner: "TransitAgent" },
      { id: "t-act-3", text: "Establish crowd-control holding lanes at Transit Plaza gates.", status: "completed", owner: "CrowdAgent" },
      { id: "t-act-4", text: "Broadcast delay and transport routing in English, Spanish, French.", status: "completed", owner: "OpsAgent" },
      { id: "t-act-5", text: "Open parking toll gates to accelerate personal car egress.", status: "completed", owner: "TransitAgent" }
    ]
  },
  {
    id: "scenario-fire-hazard",
    title: "Scenario C: Concourse Level 2 Fire Alarm Trigger",
    severity: "HIGH",
    category: "Safety & Emergency",
    description: "A small electrical fire in a concession kiosk on Concourse Level 2 triggers a localized smoke alarm. Minor panic begins to bubble. Stadium evacuation protocol needs to be managed for Section 212-218.",
    affectedArea: "Concourse Level 2 East",
    hotspotId: "hotspot-concourse-e",
    agents: ["RescueAgent", "CrowdAgent", "OpsAgent", "TransitAgent"],
    debate: [
      {
        agent: "RescueAgent",
        avatar: "🏥",
        color: "text-red-400",
        message: "CRITICAL: local smoke detector tripped at Section 214 Concession. Fire suppression system activated. Dispatching emergency response squad 2 and alerting East Rutherford Fire Dept. We must evacuate sections 212 through 218 immediately."
      },
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "SAFETY: Evacuation must be highly structured. Gate C and East stairs are the natural exits, but Gate C is currently experiencing heavy exit traffic from Level 1. I am deploying stadium marshals to guide Section 212-218 fans away from East stairs, redirecting them towards North exit Gate B."
      },
      {
        agent: "OpsAgent",
        avatar: "👷",
        color: "text-purple-400",
        message: "MANAGEMENT ACTION: Activating target public address system for Level 2 East. Digital signs in Sections 212-218 are changing to show emergency arrows pointing to Gate B. PA Announcement: 'A localized smoke alarm has been triggered. Please walk calmly to exit Gate B. Avoid Gate C.'"
      },
      {
        agent: "RescueAgent",
        avatar: "🏥",
        color: "text-red-400",
        message: "UPDATE: Local response team is on site with fire extinguishers. Kiosk fryer electrical fire has been extinguished. Fire department is ventilation-monitoring. Evacuation is proceeding in a calm manner, no injuries reported."
      },
      {
        agent: "CrowdAgent",
        avatar: "👮",
        color: "text-blue-400",
        message: "UPDATE: Sections 212-218 are fully cleared. Rerouting flow was successful. Crowd is safely in the outer plaza."
      }
    ],
    actionPlan: [
      { id: "f-act-1", text: "Dispatch Emergency Response Squad 2 & Alert Local Fire Dept.", status: "completed", owner: "RescueAgent" },
      { id: "f-act-2", text: "Cordon off Section 214 concourse corridor.", status: "completed", owner: "CrowdAgent" },
      { id: "f-act-3", text: "Redirect Section 212-218 evacuation path towards Gate B.", status: "completed", owner: "CrowdAgent" },
      { id: "f-act-4", text: "Broadcast targeted evacuation announcement on Level 2 East.", status: "completed", owner: "OpsAgent" }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CCTV_FEEDS, SCENARIOS };
}
