(function () {
  /**
   * Premium Finance Gap Calculator - Iframe Embed Loader
   * Captures partner-specific customization from script attributes and mounts a responsive iframe.
   */
  const script = document.currentScript;
  if (!script) return;

  // 1. Extract configurations from data-attributes
  const targetId = script.getAttribute("data-target") || "premium-gap-calculator";
  const partnerId = script.getAttribute("data-partner-id") || "";
  const agencyName = script.getAttribute("data-agency-name") || "";
  const theme = script.getAttribute("data-theme") || "light";
  const accent = script.getAttribute("data-accent") || "";
  const mode = script.getAttribute("data-mode") || "";
  const compact = script.getAttribute("data-compact") || "false";

  // 2. Identify script origin/base URL dynamically
  const scriptUrl = new URL(script.src);
  const baseUrl = scriptUrl.origin;

  // 3. Build target iframe query parameters
  const params = new URLSearchParams();
  params.append("embed", "true");
  if (partnerId) params.append("partner_id", partnerId);
  if (agencyName) params.append("agency_name", agencyName);
  if (theme) params.append("theme", theme);
  if (accent) params.append("accent", accent);
  if (compact === "true") params.append("compact", "true");

  const iframeSrc = `${baseUrl}/${params.toString() ? "?" + params.toString() : ""}`;

  // 4. Find mounting destination
  const mountTarget = document.getElementById(targetId);
  if (!mountTarget) {
    console.warn(`[Premium Finance Gap] Target container with ID "${targetId}" not found in document.`);
    return;
  }

  // Prevent duplicate mounts on same container
  if (mountTarget.querySelector("iframe[title='Premium Finance Gap Calculator']")) {
    return;
  }

  // 5. Create responsive Iframe container
  const iframe = document.createElement("iframe");
  iframe.src = iframeSrc;
  iframe.title = "Premium Finance Gap Calculator";
  iframe.loading = "lazy";
  iframe.style.width = "100%";
  iframe.style.height = compact === "true" ? "420px" : "740px"; // Sensible default height
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.borderRadius = "16px";
  iframe.style.transition = "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
  
  // Apply a subtle elevation shadow if theme is light
  if (theme !== "dark") {
    iframe.style.boxShadow = "0 4px 24px -3px rgba(0,0,0,0.04), 0 2px 8px -2px rgba(0,0,0,0.02)";
  }

  // 6. Set up listener to auto-resize iframe based on message events from App.tsx
  window.addEventListener("message", function (event) {
    // Basic verification of incoming message structure
    if (event.data && event.data.type === "pfg_resize" && typeof event.data.height === "number") {
      // Validate that message comes from our iframe source to prevent clickjacking or pollution
      if (iframe.contentWindow === event.source) {
        iframe.style.height = event.data.height + "px";
      }
    }
  });

  // 7. Inject into target element
  mountTarget.appendChild(iframe);
})();
