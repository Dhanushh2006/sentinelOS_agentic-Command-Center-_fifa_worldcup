/**
 * SentinelOS - TabManager Subsystem
 * Orchestrates viewport display swaps and navigation breadcrumb titles.
 */

const TabManager = {
  switch(tabId) {
    const tabs = ["command", "cctv", "transit", "volunteers", "fan", "settings"];
    
    tabs.forEach(t => {
      // Hide all view screens
      const view = document.getElementById(`tab-view-${t}`);
      if (view) view.classList.add("hidden");
      
      // Reset sidebar link active classes
      const btn = document.getElementById(`nav-${t}`);
      if (btn) {
        btn.className = "w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all group";
        // Reset color tag on span/icon
        const icon = btn.querySelector("i");
        if (icon) icon.className.baseVal = icon.className.baseVal.replace("text-cyan-400", "");
      }
    });

    // Show active view
    const activeView = document.getElementById(`tab-view-${tabId}`);
    if (activeView) activeView.classList.remove("hidden");

    // Highlight active sidebar button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
      activeBtn.className = "w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.04)] transition-all group";
      const icon = activeBtn.querySelector("i");
      if (icon) icon.classList.add("text-cyan-400");
    }

    // Update Breadcrumb
    const breadcrumbLabels = {
      command: "Command Center",
      cctv: "CCTV Ingestion Directory",
      transit: "Transit Platform Status",
      volunteers: "Volunteers Operations Console",
      fan: "Fan Experience & ADA Guide",
      settings: "AI Model Config Parameters"
    };
    elements.tabBreadcrumb.textContent = breadcrumbLabels[tabId] || "Command Center";
  }
};

// Bind to window for HTML onclick triggers
window.switchTab = function(tabId) {
  TabManager.switch(tabId);
};
