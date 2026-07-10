import React, { useState } from "react";
import { CalculatorInputs, CalculatorOutputs, AttributionData, LeadPayload } from "../types";
import { formatCurrency, trackEvent } from "../utils/calculations";
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  CornerUpLeft,
  Loader2
} from "lucide-react";

interface ReferralFormProps {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  attribution: AttributionData;
  leadEndpoint: string;
  tallyFallbackUrl: string;
  successRedirectUrl: string;
  onBackToResults: () => void;
  accentColor: string;
}

export default function ReferralForm({
  inputs,
  outputs,
  attribution,
  leadEndpoint,
  tallyFallbackUrl,
  successRedirectUrl,
  onBackToResults,
  accentColor
}: ReferralFormProps) {
  // Form Field States
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  // Flow & UI States
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate unique reference code
  const generateReferenceCode = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PFG-${year}${month}${day}-${randomHex}`;
  };

  // Build prefilled Tally URL
  const getPrefilledTallyUrl = (): string => {
    try {
      const baseUrl = tallyFallbackUrl || "https://tally.so/r/wMD5be";
      const url = new URL(baseUrl);
      
      url.searchParams.append("ref_code", referenceCode || generateReferenceCode());
      url.searchParams.append("business_name", businessName);
      url.searchParams.append("contact_name", contactName);
      url.searchParams.append("email", email);
      url.searchParams.append("phone", phone);
      url.searchParams.append("agent_name", agentName);
      url.searchParams.append("agent_email", agentEmail);
      url.searchParams.append("agency_name", attribution.agencyName);
      url.searchParams.append("notes", notes);
      
      // Add numeric parameters formatted as strings
      url.searchParams.append("renewal_premium", inputs.renewalPremium.toString());
      url.searchParams.append("required_down_payment", outputs.requiredDownPayment.toFixed(2));
      url.searchParams.append("down_payment_gap", outputs.downPaymentGap.toFixed(2));
      url.searchParams.append("premium_finance_balance", outputs.premiumFinanceBalance.toFixed(2));
      url.searchParams.append("term_months", inputs.termMonths.toString());
      url.searchParams.append("estimated_monthly_installment", outputs.estimatedMonthlyInstallment.toFixed(2));
      url.searchParams.append("policy_type", inputs.policyType || "Not specified");
      url.searchParams.append("partner_id", attribution.partnerId);
      
      // Campaign parameters
      if (attribution.utmSource) url.searchParams.append("utm_source", attribution.utmSource);
      if (attribution.utmMedium) url.searchParams.append("utm_medium", attribution.utmMedium);
      if (attribution.utmCampaign) url.searchParams.append("utm_campaign", attribution.utmCampaign);

      return url.toString();
    } catch (e) {
      console.error("Error generating Tally URL", e);
      return tallyFallbackUrl || "https://tally.so/r/wMD5be";
    }
  };

  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};

    if (!businessName.trim()) tempErrors.businessName = "Business name is required.";
    if (!contactName.trim()) tempErrors.contactName = "Contact name is required.";
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = "Contact email is required.";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!phone.trim()) {
      tempErrors.phone = "Phone number is required.";
    }

    if (!agentName.trim()) tempErrors.agentName = "Agent/Producer name is required.";
    
    if (agentEmail.trim() && !emailRegex.test(agentEmail)) {
      tempErrors.agentEmail = "Please enter a valid agent email address.";
    }

    if (!consent) {
      tempErrors.consent = "You must authorize this submission.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      trackEvent("pfg_lead_error", { reason: "validation_failed" });
      return;
    }

    setStatus("submitting");
    const code = generateReferenceCode();
    setReferenceCode(code);

    // Assemble payload
    const payload: LeadPayload = {
      // Calculator values
      ...inputs,
      ...outputs,
      // Attribution
      ...attribution,
      // Metadata
      leadType: "commercial_insurance_renewal_gap",
      sourceTool: "premium_finance_gap_calculator",
      // Lead intake details
      businessName,
      contactName,
      email,
      phone,
      agentName,
      agentEmail,
      notes,
      consent,
      submittedAt: new Date().toISOString(),
    };

    trackEvent("pfg_lead_submit", { partner_id: attribution.partnerId, premium: inputs.renewalPremium });

    if (!leadEndpoint) {
      // No endpoint configured, trigger fallback instantly to ensure reliable lead intake
      setTimeout(() => {
        setStatus("error");
        setErrorMessage("Direct API endpoint routing is currently unconfigured.");
        trackEvent("pfg_tally_fallback", { reason: "no_endpoint" });
      }, 800);
      return;
    }

    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("success");
        trackEvent("pfg_lead_success", { ref_code: code });
        
        // Handle custom success redirect
        if (successRedirectUrl) {
          window.location.href = successRedirectUrl;
        }
      } else {
        throw new Error(`Server responded with code ${response.status}`);
      }
    } catch (err: any) {
      console.error("Primary endpoint routing failed", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to establish a connection to our lead router.");
      trackEvent("pfg_tally_fallback", { reason: "network_error", details: err.message });
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 text-center animate-fadeIn" id="pfg-referral-success">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Referral Submitted Successfully</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your premium finance rescue referral is queued. An underwriting specialist will contact you and your client shortly.
          </p>
        </div>

        <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 max-w-sm mx-auto space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase block">Reference Code</span>
          <span className="text-lg font-mono font-bold text-gray-700 tracking-wide block" id="ref-code-display">{referenceCode}</span>
          <span className="text-[10px] text-gray-400 block">Please quote this code for inquiries.</span>
        </div>

        <div className="pt-4 border-t border-gray-100 max-w-sm mx-auto">
          <button
            onClick={onBackToResults}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 py-3 rounded-xl transition-colors cursor-pointer"
          >
            <CornerUpLeft className="h-4 w-4" />
            <span>Back to Calculator</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 animate-fadeIn" id="pfg-referral-form-container">
      
      {/* Header Info */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Referral & Funding Request</h3>
          <p className="text-xs text-gray-500 mt-1">Submit this risk gap for underwriting triage and premium funding options.</p>
        </div>
        <button
          onClick={onBackToResults}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {/* Summary of what is being referred */}
      <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/30 flex items-center justify-between text-xs text-teal-900">
        <div>
          <span className="font-semibold block text-teal-800">Gap Rescue Target: {formatCurrency(outputs.downPaymentGap)}</span>
          <span className="text-teal-600 block mt-0.5">Policy Balance: {formatCurrency(outputs.premiumFinanceBalance)} | Premium: {formatCurrency(inputs.renewalPremium)}</span>
        </div>
        <div className="text-right text-teal-600 hidden sm:block">
          <span>{inputs.policyType || "General Policy"}</span>
        </div>
      </div>

      {/* Error state with direct Tally fallback */}
      {status === "error" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Direct Route Bypass</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {errorMessage} To ensure your referral is logged immediately without loss, click below to route through our certified secure fallback partner Tally. All inputs have been prefilled.
              </p>
            </div>
          </div>
          <a
            href={getPrefilledTallyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            id="tally-fallback-link"
          >
            <span>Complete Referral via Tally Fallback</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Actual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Business and Contact Segment */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Insured Business Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Business Name */}
            <div className="space-y-1.5">
              <label htmlFor="businessName" className="block text-xs font-medium text-gray-700">Business Name *</label>
              <input
                type="text"
                id="businessName"
                placeholder="Acme Logistics Inc."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.businessName ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.businessName && <p className="text-[10px] text-red-600">{errors.businessName}</p>}
            </div>

            {/* Contact Name */}
            <div className="space-y-1.5">
              <label htmlFor="contactName" className="block text-xs font-medium text-gray-700">Contact / Owner Name *</label>
              <input
                type="text"
                id="contactName"
                placeholder="Jane Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.contactName ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.contactName && <p className="text-[10px] text-red-600">{errors.contactName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">Contact Email *</label>
              <input
                type="email"
                id="email"
                placeholder="jdoe@acmelogistics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.email ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700">Contact Phone *</label>
              <input
                type="tel"
                id="phone"
                placeholder="(555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.phone ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-600">{errors.phone}</p>}
            </div>

          </div>
        </div>

        {/* Referring Agent Segment */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Referring Agent / Partner Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Agent Name */}
            <div className="space-y-1.5">
              <label htmlFor="agentName" className="block text-xs font-medium text-gray-700">Producer / Agent Name *</label>
              <input
                type="text"
                id="agentName"
                placeholder="Jason Feimster"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.agentName ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.agentName && <p className="text-[10px] text-red-600">{errors.agentName}</p>}
            </div>

            {/* Agent Email */}
            <div className="space-y-1.5">
              <label htmlFor="agentEmail" className="block text-xs font-medium text-gray-700">Agent Email (For copy of summary)</label>
              <input
                type="email"
                id="agentEmail"
                placeholder="jason@youragency.com"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                className={`block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                  errors.agentEmail ? "border-red-300 ring-2 ring-red-500/10" : ""
                }`}
              />
              {errors.agentEmail && <p className="text-[10px] text-red-600">{errors.agentEmail}</p>}
            </div>

          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="notes" className="block text-xs font-medium text-gray-700">Underwriting Notes / Special Requests</label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Insured prefers a 10-month schedule. Renewal deadline is next week."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Compliance and Consent Checkbox */}
        <div className="space-y-2 pt-2">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
            <div className="ml-3 text-xs leading-normal">
              <label htmlFor="consent" className="font-medium text-gray-700">
                I authorize this premium gap referral submission. *
              </label>
              <p className="text-gray-400">Submission does not guarantee financing or alter existing policy terms. Do not submit sensitive bank credentials or tax documents.</p>
            </div>
          </div>
          {errors.consent && <p className="text-[10px] text-red-600 mt-0.5">{errors.consent}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToResults}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all"
            disabled={status === "submitting"}
          >
            Back to results
          </button>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="text-white font-semibold text-sm py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 shadow-xs transition-all disabled:opacity-55"
            style={{ backgroundColor: accentColor }}
            id="btn-referral-submit"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Routing lead...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Secure Referral</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
