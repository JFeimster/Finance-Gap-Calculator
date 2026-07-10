import React, { useState, useEffect } from "react";
import { AppConfig, AttributionData, CalculatorInputs, CalculatorOutputs } from "./types";
import { initializeConfig, initializeAttribution, STORAGE_KEY_PREFIX } from "./config";
import { calculatePremiumGap, trackEvent } from "./utils/calculations";
import LandingPage from "./components/LandingPage";
import Calculator from "./components/Calculator";
import ResultView from "./components/ResultView";
import ReferralForm from "./components/ReferralForm";

const DEFAULT_INPUTS: CalculatorInputs = {
  renewalPremium: 100000, // Preloaded with Test Case 1 values!
  downPaymentPercent: 25,
  cashAvailable: 10000,
  termMonths: 10,
  knownFinanceCharges: 0,
  renewalEffectiveDate: "",
  policyType: "",
};

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [attribution, setAttribution] = useState<AttributionData | null>(null);
  
  // State for inputs & outputs
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<CalculatorOutputs | null>(null);

  // Widget settings
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [widgetTheme, setWidgetTheme] = useState<"light" | "dark">("light");
  const [showWidgetReferral, setShowWidgetReferral] = useState(false);

  // Load configuration and cached calculations on mount
  useEffect(() => {
    const activeConfig = initializeConfig();
    const activeAttribution = initializeAttribution();
    
    setConfig(activeConfig);
    setAttribution(activeAttribution);

    // Track initial page view
    trackEvent("pfg_view", { 
      partner_id: activeAttribution.partnerId,
      embed_mode: window.location.search.includes("embed=true")
    });

    // Parse specific widget/embed search parameters
    const params = new URLSearchParams(window.location.search);
    const embed = params.get("embed") === "true" || params.get("widget") === "true";
    setIsWidgetMode(embed);

    const compact = params.get("compact") === "true";
    setIsCompact(compact);

    // Custom theme styling
    const themeParam = params.get("theme");
    if (themeParam === "dark") {
      setWidgetTheme("dark");
    } else if (themeParam === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setWidgetTheme(prefersDark ? "dark" : "light");
    }

    // Try loading cached input state from versioned localStorage
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}:inputs`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Safely set loaded parameters if they look valid
        setInputs(prev => ({
          ...prev,
          ...parsed,
          // Never persist PII (though we don't have it in this object)
        }));
      }
    } catch (e) {
      console.error("Failed to load cached inputs from localStorage", e);
    }
  }, []);

  // Compute outputs whenever inputs change
  useEffect(() => {
    const results = calculatePremiumGap(inputs);
    setOutputs(results);

    // Cache updated numeric values in localStorage (versioned & safely filtered)
    if (config) {
      try {
        const cacheData = {
          renewalPremium: inputs.renewalPremium,
          downPaymentPercent: inputs.downPaymentPercent,
          cashAvailable: inputs.cashAvailable,
          termMonths: inputs.termMonths,
          knownFinanceCharges: inputs.knownFinanceCharges,
          renewalEffectiveDate: inputs.renewalEffectiveDate,
          policyType: inputs.policyType,
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}:inputs`, JSON.stringify(cacheData));
      } catch (e) {
        console.error("Failed to cache inputs in localStorage", e);
      }
    }
  }, [inputs, config]);

  // Handle postMessage resize communications to support iframe resizing
  useEffect(() => {
    if (isWidgetMode) {
      const handleResize = () => {
        try {
          const height = document.documentElement.scrollHeight || document.body.scrollHeight;
          window.parent.postMessage({ type: "pfg_resize", height }, "*");
        } catch (e) {
          // Avoid crashing if origin restriction policies prevent it
        }
      };

      // Send initial size and bind observers
      handleResize();
      window.addEventListener("resize", handleResize);

      const observer = new ResizeObserver(handleResize);
      observer.observe(document.body);

      return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
      };
    }
  }, [isWidgetMode, showWidgetReferral, inputs, outputs]);

  const handleInputChange = (newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    trackEvent("pfg_calculate", { premium: newInputs.renewalPremium });
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setShowWidgetReferral(false);
    trackEvent("pfg_reset");
  };

  // Guard loading state until initialized
  if (!config || !attribution || !outputs) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Loading Calculator...</p>
        </div>
      </div>
    );
  }

  const activeAccent = config.accentColor || "#00A88F";

  // RENDER EMBEDDED WIDGET ONLY
  if (isWidgetMode) {
    const isDark = widgetTheme === "dark";
    return (
      <div 
        className={`p-4 sm:p-6 min-h-screen flex flex-col justify-center transition-colors ${
          isDark ? "bg-[#111827] text-white" : "bg-transparent text-gray-900"
        }`}
        id="widget-root-container"
      >
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {/* Brand identifier */}
          {config.brandName && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100/10 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight uppercase" style={{ color: activeAccent }}>
                  {config.brandName}
                </span>
                <span className="text-[10px] text-gray-400">Renewal Gap Analysis</span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                Widget v1.0
              </span>
            </div>
          )}

          {/* Simple Grid Layout for the widget */}
          <div className={`grid grid-cols-1 ${isCompact ? "" : "lg:grid-cols-12"} gap-6 items-start`}>
            
            {/* Input Form Column */}
            <div className={isCompact ? "w-full" : "lg:col-span-7"}>
              {!showWidgetReferral ? (
                <Calculator
                  inputs={inputs}
                  onChange={handleInputChange}
                  onReset={handleReset}
                  accentColor={activeAccent}
                />
              ) : (
                <ReferralForm
                  inputs={inputs}
                  outputs={outputs}
                  attribution={attribution}
                  leadEndpoint={config.leadEndpoint}
                  tallyFallbackUrl={config.tallyFallbackUrl}
                  successRedirectUrl={config.successRedirectUrl}
                  onBackToResults={() => setShowWidgetReferral(false)}
                  accentColor={activeAccent}
                />
              )}
            </div>

            {/* Results Grid Column */}
            <div className={isCompact ? "w-full" : "lg:col-span-5"}>
              <ResultView
                inputs={inputs}
                outputs={outputs}
                primaryCtaLabel={config.primaryCtaLabel}
                onReferralTrigger={() => setShowWidgetReferral(true)}
                accentColor={activeAccent}
              />
            </div>

          </div>
          
        </div>
      </div>
    );
  }

  // RENDER STANDARD FULL-PAGE LANDING PAGE
  return (
    <LandingPage
      inputs={inputs}
      outputs={outputs}
      config={config}
      attribution={attribution}
      onInputChange={handleInputChange}
      onReset={handleReset}
      accentColor={activeAccent}
    />
  );
}
