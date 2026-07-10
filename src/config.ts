import { AppConfig, AttributionData } from "./types";

// Default system configurations
export const DEFAULT_CONFIG: AppConfig = {
  brandName: "Agency Renewal Rescue",
  logoUrl: "",
  primaryCtaLabel: "Refer a Renewal-Risk Client",
  leadEndpoint: "", // Configured endpoint for POST requests
  tallyFallbackUrl: "https://tally.so/r/wMD5be", // Default fallback Tally form
  defaultPartnerId: "DIRECT",
  privacyUrl: "#",
  accentColor: "#2563eb", // Royal blue for Sleek Interface
  successRedirectUrl: "",
  debug: true,
};

// Key used for localStorage
export const STORAGE_KEY_PREFIX = "premiumGapCalculator:v1";

/**
 * Parses URL search parameters into attribution data.
 */
export function getUrlAttribution(): Partial<AttributionData> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const data: Partial<AttributionData> = {};

  const partnerId = params.get("partner_id") || params.get("partner") || params.get("p");
  if (partnerId) data.partnerId = partnerId;

  const agencyName = params.get("agency_name") || params.get("agency") || params.get("a");
  if (agencyName) data.agencyName = agencyName;

  const ref = params.get("ref") || params.get("r");
  if (ref) data.ref = ref;

  const source = params.get("source") || params.get("s");
  if (source) data.source = source;

  const campaign = params.get("campaign") || params.get("c");
  if (campaign) data.campaign = campaign;

  // Standard UTM parameters
  const utmSource = params.get("utm_source");
  if (utmSource) data.utmSource = utmSource;

  const utmMedium = params.get("utm_medium");
  if (utmMedium) data.utmMedium = utmMedium;

  const utmCampaign = params.get("utm_campaign");
  if (utmCampaign) data.utmCampaign = utmCampaign;

  const utmContent = params.get("utm_content");
  if (utmContent) data.utmContent = utmContent;

  const utmTerm = params.get("utm_term");
  if (utmTerm) data.utmTerm = utmTerm;

  data.pageUrl = window.location.href;

  return data;
}

/**
 * Reads attribution from session storage or local storage, prioritizing URL parameters.
 * Never overwrites existing attribution with blank/null values.
 */
export function initializeAttribution(): AttributionData {
  const urlData = getUrlAttribution();
  
  // Try to load existing attribution from storage
  let savedData: Partial<AttributionData> = {};
  try {
    const json = localStorage.getItem(`${STORAGE_KEY_PREFIX}:attribution`);
    if (json) {
      savedData = JSON.parse(json);
    }
  } catch (e) {
    console.error("Failed to read attribution from localStorage", e);
  }

  // Merge, prioritizing URL values, then saved values, then defaults
  const merged: AttributionData = {
    partnerId: urlData.partnerId || savedData.partnerId || DEFAULT_CONFIG.defaultPartnerId,
    agencyName: urlData.agencyName || savedData.agencyName || "Independent Partner",
    ref: urlData.ref || savedData.ref || "",
    source: urlData.source || savedData.source || "",
    campaign: urlData.campaign || savedData.campaign || "",
    utmSource: urlData.utmSource || savedData.utmSource || "",
    utmMedium: urlData.utmMedium || savedData.utmMedium || "",
    utmCampaign: urlData.utmCampaign || savedData.utmCampaign || "",
    utmContent: urlData.utmContent || savedData.utmContent || "",
    utmTerm: urlData.utmTerm || savedData.utmTerm || "",
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
  };

  // Save merged result back to localStorage
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:attribution`, JSON.stringify(merged));
  } catch (e) {
    console.error("Failed to save attribution to localStorage", e);
  }

  return merged;
}

/**
 * Loads and merges brand configurations from config, custom window variables, and URL search parameters
 */
export function initializeConfig(): AppConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  const params = new URLSearchParams(window.location.search);
  
  // Read window custom configuration (if injected by partner page script or index.html config block)
  const windowConfig = (window as any).PREMIUM_GAP_CONFIG || {};

  const merged: AppConfig = {
    brandName: params.get("brand_name") || windowConfig.brandName || DEFAULT_CONFIG.brandName,
    logoUrl: params.get("logo_url") || windowConfig.logoUrl || DEFAULT_CONFIG.logoUrl,
    primaryCtaLabel: params.get("cta_label") || windowConfig.primaryCtaLabel || DEFAULT_CONFIG.primaryCtaLabel,
    leadEndpoint: params.get("endpoint") || windowConfig.leadEndpoint || DEFAULT_CONFIG.leadEndpoint,
    tallyFallbackUrl: params.get("tally_url") || windowConfig.tallyFallbackUrl || DEFAULT_CONFIG.tallyFallbackUrl,
    defaultPartnerId: params.get("default_partner_id") || windowConfig.defaultPartnerId || DEFAULT_CONFIG.defaultPartnerId,
    privacyUrl: params.get("privacy_url") || windowConfig.privacyUrl || DEFAULT_CONFIG.privacyUrl,
    accentColor: params.get("accent") || windowConfig.accentColor || DEFAULT_CONFIG.accentColor,
    successRedirectUrl: params.get("redirect_url") || windowConfig.successRedirectUrl || DEFAULT_CONFIG.successRedirectUrl,
    debug: params.get("debug") === "true" || windowConfig.debug || DEFAULT_CONFIG.debug,
  };

  return merged;
}
