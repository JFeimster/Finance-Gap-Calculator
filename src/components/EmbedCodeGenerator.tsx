import React, { useState, useEffect } from "react";
import { Copy, Check, Code, ExternalLink, Settings, Sparkles } from "lucide-react";
import { trackEvent } from "../utils/calculations";

export default function EmbedCodeGenerator() {
  const [partnerId, setPartnerId] = useState("AGENT-123");
  const [brandName, setBrandName] = useState("Acme Insurance");
  const [accentColor, setAccentColor] = useState("#00A88F");
  
  const [iframeCopied, setIframeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [domain, setDomain] = useState("https://ai-premium-rescue.run.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.origin);
    }
  }, []);

  // Encode values for query string
  const getEncodedParams = (isEmbed: boolean) => {
    const params = new URLSearchParams();
    if (isEmbed) params.append("embed", "true");
    if (partnerId.trim()) params.append("partner_id", partnerId.trim());
    if (brandName.trim()) params.append("brand_name", brandName.trim());
    if (accentColor) params.append("accent", accentColor);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const iframeCode = `<iframe
  src="${domain}/${getEncodedParams(true)}"
  title="Premium Finance Gap Calculator"
  loading="lazy"
  width="100%"
  height="720"
  style="border:0;max-width:100%;border-radius:16px;box-shadow:0 4px 20px -2px rgba(0,0,0,0.05);"
></iframe>`;

  const coBrandedLink = `${domain}/${getEncodedParams(false)}`;

  const handleCopyCode = async (type: "iframe" | "link") => {
    const textToCopy = type === "iframe" ? iframeCode : coBrandedLink;
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (type === "iframe") {
        setIframeCopied(true);
        setTimeout(() => setIframeCopied(false), 2000);
      } else {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
      trackEvent("pfg_copy_embed", { type, partner_id: partnerId });
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6" id="embed-generator-section">
      
      {/* Header section */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-50 justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-teal-600 shrink-0" />
          <h3 className="text-lg font-semibold text-gray-950 tracking-tight">Co-Branded Agency Setup</h3>
        </div>
        <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Partner Tools
        </span>
      </div>

      {/* Editor inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 rounded-xl p-5 border border-gray-100">
        
        {/* Partner ID Input */}
        <div className="space-y-1.5">
          <label htmlFor="embed-partner-id" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Partner / Agency ID
          </label>
          <input
            type="text"
            id="embed-partner-id"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            placeholder="e.g. AGENT-123"
            className="block w-full bg-white rounded-lg border border-gray-200 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 font-semibold"
          />
          <span className="text-[10px] text-gray-400 block">Identifies who receives client commissions & attribution.</span>
        </div>

        {/* Agency Brand Name */}
        <div className="space-y-1.5">
          <label htmlFor="embed-brand-name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Agency Brand Title
          </label>
          <input
            type="text"
            id="embed-brand-name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Acme Insurance"
            className="block w-full bg-white rounded-lg border border-gray-200 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 font-semibold"
          />
          <span className="text-[10px] text-gray-400 block">Sets custom name in top headers and results disclosure.</span>
        </div>

        {/* Accent Color picker */}
        <div className="space-y-1.5">
          <label htmlFor="embed-color" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center justify-between">
            <span>Brand Accent Color</span>
            <span className="text-[10px] font-mono text-gray-400 font-bold">{accentColor}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              id="embed-color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-10 w-12 bg-white rounded-lg border border-gray-200 p-1 cursor-pointer outline-none shrink-0"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#00A88F"
              className="block w-full bg-white rounded-lg border border-gray-200 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 font-semibold font-mono"
            />
          </div>
          <span className="text-[10px] text-gray-400 block">Applies to buttons, links, and progress bars.</span>
        </div>

      </div>

      {/* Copy snippets tabs */}
      <div className="space-y-5">
        
        {/* Iframe copy code snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Option A: Responsive Iframe Embed</span>
            <button
              onClick={() => handleCopyCode("iframe")}
              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-all flex items-center gap-1 py-1 px-2.5 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
            >
              {iframeCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied Code!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-300 text-[11px] p-4 rounded-xl font-mono overflow-x-auto leading-relaxed border border-slate-800 select-all max-h-36">
            {iframeCode}
          </pre>
          <p className="text-[10px] text-gray-400">
            Copy and paste this into any web page editor (WordPress, Webflow, agency site) to embed the calculator inside a premium sandboxed container.
          </p>
        </div>

        {/* Link copy code snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Option B: Co-Branded Campaign Link</span>
            <button
              onClick={() => handleCopyCode("link")}
              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-all flex items-center gap-1 py-1 px-2.5 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
            >
              {linkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                  <span>Copy Web Link</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-xl p-3 select-all">
            <span className="text-xs font-semibold text-gray-600 truncate flex-1 font-mono">{coBrandedLink}</span>
            <a
              href={coBrandedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-0.5 shrink-0"
            >
              <span>Preview</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-[10px] text-gray-400">
            Paste this co-branded link in renewal reminder emails, SMS follow-ups, newsletters, CRM automation flows, or producer email signatures.
          </p>
        </div>

      </div>

    </div>
  );
}
