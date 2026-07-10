import React, { useState } from "react";
import { AppConfig, AttributionData, CalculatorInputs, CalculatorOutputs } from "../types";
import { formatCurrency } from "../utils/calculations";
import Calculator from "./Calculator";
import ResultView from "./ResultView";
import ReferralForm from "./ReferralForm";
import FAQ from "./FAQ";
import EmbedCodeGenerator from "./EmbedCodeGenerator";
import { 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  TrendingUp, 
  Briefcase, 
  HelpCircle,
  ShieldCheck,
  Percent,
  Coins
} from "lucide-react";

interface LandingPageProps {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  config: AppConfig;
  attribution: AttributionData;
  onInputChange: (inputs: CalculatorInputs) => void;
  onReset: () => void;
  accentColor: string;
}

export default function LandingPage({
  inputs,
  outputs,
  config,
  attribution,
  onInputChange,
  onReset,
  accentColor
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"calculator" | "embed">("calculator");
  const [showReferralForm, setShowReferralForm] = useState(false);

  const steps = [
    {
      num: "01",
      title: "Input Renewal Terms",
      desc: "Enter premium totals and down-payment requirements directly from the carrier quote."
    },
    {
      num: "02",
      title: "Identify Immediate Gaps",
      desc: "Instantly quantify the exact cash gap keeping the client from binding coverage."
    },
    {
      num: "03",
      title: "Submit a Safe Referral",
      desc: "Initiate professional premium funding triage and protect your agency's renewal commissions."
    }
  ];

  const pointsWhyStalls = [
    {
      icon: <ShieldAlert className="h-5 w-5 text-amber-500" />,
      title: "Sudden Capital Outlay",
      desc: "Carrier minimum down payments can demand 25% to 35% of premium immediately in cash."
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-teal-500" />,
      title: "Seasonal Cash Squeezes",
      desc: "Small and mid-sized businesses frequently struggle with dry cash cycles despite robust annual balances."
    },
    {
      icon: <Briefcase className="h-5 w-5 text-blue-500" />,
      title: "Friction & Paperwork",
      desc: "Traditional premium financing requires slow quotes and duplicate application portals."
    },
    {
      icon: <Percent className="h-5 w-5 text-indigo-500" />,
      title: "Active Competitor Poaching",
      desc: "When a client stalls on a down payment, other agents quickly step in with split installment programs."
    }
  ];

  const scrollToCalculator = () => {
    setShowReferralForm(false);
    setActiveTab("calculator");
    const container = document.getElementById("calculator-scroll-target");
    if (container) {
      container.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-gray-900 min-h-screen flex flex-col font-sans selection:bg-teal-500/10" id="landing-page-root">
      
      {/* Slim Co-brandable Header */}
      <header className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div 
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-xs shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              PR
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-gray-950 block">{config.brandName}</span>
              <span className="text-[10px] text-gray-400 font-medium block">Commercial Renewal Protection Tool</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {attribution.partnerId && attribution.partnerId !== "DIRECT" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50 rounded-lg border border-teal-100 text-[10px] text-teal-800 font-bold">
                <Sparkles className="h-3 w-3 text-teal-600" />
                <span>Co-Branded Partner: {attribution.agencyName} ({attribution.partnerId})</span>
              </div>
            )}
            <button
              onClick={scrollToCalculator}
              className="text-xs font-semibold py-2 px-4 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer hidden sm:block"
              style={{ backgroundColor: accentColor }}
            >
              Launch Calculator
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-24 border-b border-gray-100 bg-white px-4 sm:px-6 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-gray-200/50 rounded-full text-xs font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Commission & Renewal Protection Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight">
              Don’t let the down payment <span className="text-gray-400">kill the renewal.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              Quantify upfront carrier premium demands, isolate available capital gaps, and secure custom payment triage alternatives before the renewal account slips away to competitors.
            </p>

            {/* Quick value badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 max-w-md">
              <div>
                <span className="text-2xl font-bold text-gray-950 block">Instant</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Gap calculation</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-950 block">No PII</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Saved to local storage</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-950 block">Reliable</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Fallback routing</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Features Card Graphic */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-[#FAF9F6] border border-gray-200/75 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xs space-y-5 relative">
              <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">
                Planning Tool
              </div>
              
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Active Protection Goals
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block">Isolate Upfront Obstacles</strong>
                    <span className="text-[11px] text-gray-500 block">Identify exactly what cash is lacking, from 1% to 100% of the down payment.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block">Estimate Installments</strong>
                    <span className="text-[11px] text-gray-500 block">Display safe repayment estimates including custom fees and term length parameters.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block">Direct Referral Routing</strong>
                    <span className="text-[11px] text-gray-500 block">Route client down-payment shortfalls directly to certified premium funding underwriters.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={scrollToCalculator}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch Dynamic Calculator</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Primary Interaction Area - Sticky Target */}
      <section className="py-12 md:py-20 px-4 sm:px-6 relative z-10 scroll-mt-14" id="calculator-scroll-target">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Navigation tabs */}
          <div className="flex justify-center border-b border-gray-100 max-w-sm mx-auto pb-px print:hidden">
            <button
              onClick={() => { setActiveTab("calculator"); setShowReferralForm(false); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
                activeTab === "calculator"
                  ? "border-teal-500 text-teal-700"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
              style={{ borderBottomColor: activeTab === "calculator" ? accentColor : "", color: activeTab === "calculator" ? accentColor : "" }}
            >
              Renewal Gap Calculator
            </button>
            <button
              onClick={() => { setActiveTab("embed"); setShowReferralForm(false); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-all cursor-pointer ${
                activeTab === "embed"
                  ? "border-teal-500 text-teal-700"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
              style={{ borderBottomColor: activeTab === "embed" ? accentColor : "", color: activeTab === "embed" ? accentColor : "" }}
            >
              Embed / Code Generator
            </button>
          </div>

          {/* Calculator Layout Tab */}
          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Inputs (Left) */}
              <div className="lg:col-span-7 print:w-full">
                {!showReferralForm ? (
                  <Calculator
                    inputs={inputs}
                    onChange={onInputChange}
                    onReset={onReset}
                    accentColor={accentColor}
                  />
                ) : (
                  <ReferralForm
                    inputs={inputs}
                    outputs={outputs}
                    attribution={attribution}
                    leadEndpoint={config.leadEndpoint}
                    tallyFallbackUrl={config.tallyFallbackUrl}
                    successRedirectUrl={config.successRedirectUrl}
                    onBackToResults={() => setShowReferralForm(false)}
                    accentColor={accentColor}
                  />
                )}
              </div>

              {/* Dynamic Analysis Cards (Right) */}
              <div className="lg:col-span-5 print:w-full print:mt-4">
                <ResultView
                  inputs={inputs}
                  outputs={outputs}
                  primaryCtaLabel={config.primaryCtaLabel}
                  onReferralTrigger={() => setShowReferralForm(true)}
                  accentColor={accentColor}
                />
              </div>

            </div>
          )}

          {/* Embed Code Tab */}
          {activeTab === "embed" && (
            <div className="max-w-4xl mx-auto animate-fadeIn print:hidden">
              <EmbedCodeGenerator />
            </div>
          )}

        </div>
      </section>

      {/* Print Specific Result Area (Hidden on screen, shown in print) */}
      <section className="hidden print:block p-8 space-y-6 text-gray-900" id="print-view-area">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-xl font-bold">{config.brandName}</h1>
            <p className="text-xs text-gray-500">Commercial Insurance Renewal Gap Summary</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Printed On:</strong> {new Date().toLocaleDateString()}</p>
            {attribution.partnerId && <p><strong>Partner Reference:</strong> {attribution.partnerId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
          <div>
            <p className="text-gray-500 uppercase font-semibold text-[10px]">Renewal Figures</p>
            <div className="space-y-1.5 mt-2">
              <p><strong>Total Premium:</strong> {formatCurrency(inputs.renewalPremium)}</p>
              <p><strong>Required Down Payment:</strong> {formatCurrency(outputs.requiredDownPayment)} ({inputs.downPaymentPercent}%)</p>
              <p><strong>Cash Currently Available:</strong> {formatCurrency(inputs.cashAvailable)}</p>
              <p><strong>Remaining Financed Balance:</strong> {formatCurrency(outputs.premiumFinanceBalance)}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 uppercase font-semibold text-[10px]">Calculated Gap Analysis</p>
            <div className="space-y-1.5 mt-2">
              <p className="text-lg font-bold text-red-600"><strong>Immediate Capital Gap:</strong> {formatCurrency(outputs.downPaymentGap)}</p>
              <p><strong>Payment Term:</strong> {inputs.termMonths} Months</p>
              <p><strong>Estimated Monthly Installment:</strong> {formatCurrency(outputs.estimatedMonthlyInstallment)}</p>
              <p><strong>Policy Line:</strong> {inputs.policyType || "Not specified"}</p>
              <p><strong>Target Effective Date:</strong> {inputs.renewalEffectiveDate || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border text-[10px] text-gray-500 leading-relaxed pt-4 mt-6">
          <strong>Important Disclosure Notice:</strong> This calculator provides an educational planning estimate based on the values entered by the user. It is not an insurance quote, a firm offer of premium financing, an approval, underwriting recommendation, or commitment to extend credit. Actual loan amounts, repayment schedules, interest charges, fees, and requirements are subject to final credit underwriting and policy validation by certified premium finance companies.
        </div>

        <div className="pt-8 text-center border-t text-[10px] text-gray-400">
          Generated via {config.brandName} (Ref Code Placeholder: PFG-PRINT)
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-t border-gray-100 px-4 sm:px-6 print:hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">How Commercial Gap Planning Works</h2>
            <p className="text-sm text-gray-500">Three easy steps to rescue a stalling client renewal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-50 border border-gray-100 rounded-2xl p-6 relative hover:shadow-xs transition-shadow">
                <span className="text-4xl font-extrabold text-teal-500/10 absolute top-4 right-4">{step.num}</span>
                <h4 className="text-base font-bold text-gray-950 mt-2">{step.title}</h4>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Renewals Stall Section */}
      <section className="py-16 px-4 sm:px-6 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Industry Obstacles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
              Why business accounts stall during renewals.
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              When a commercial premium increases or cash reserves shrink, business owners object to upfront bind requirements. That delay triggers dangerous cover-lapse risks or exposes the account to aggressive competitors offering alternative split programs.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToCalculator}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                <span>Calculate active policy gap now</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pointsWhyStalls.map((pt, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors space-y-3">
                <div className="p-2 bg-[#FAF9F6] inline-block rounded-xl">
                  {pt.icon}
                </div>
                <h4 className="text-sm font-bold text-gray-950">{pt.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{pt.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ & Final CTA */}
      <section className="py-16 bg-white border-t border-b border-gray-100 px-4 sm:px-6 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* FAQ (Left) */}
          <FAQ />

          {/* Final CTA Card (Right) */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 flex flex-col justify-between items-start relative overflow-hidden shadow-md">
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-400">
                <Zap className="h-3 w-3" />
                Protect Your Portfolio
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight max-w-sm leading-snug">
                Turn premium down-payment friction into a closed renewal.
              </h3>
              
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                Empower your service teams to instantly quantify obstacles and securely refer down-payment shortfalls for certified capital triage.
              </p>
            </div>

            <div className="pt-8 w-full relative z-10 space-y-4">
              <button
                onClick={scrollToCalculator}
                className="w-full text-slate-900 bg-white hover:bg-slate-100 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm"
              >
                <span>Refer a Renewal-Risk Client</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
              
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                Submissions are processed within minutes during standard business hours.
              </p>
            </div>

            {/* Background design elements */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-teal-500/10 blur-xl" />
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 sm:px-6 border-t border-gray-100 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2.5">
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: accentColor }}
            >
              PR
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block">{config.brandName}</span>
              <span className="text-[10px] text-gray-400 block">© 2026. All rights reserved.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href={config.privacyUrl} className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Use</a>
            <a href="mailto:support@youragency.com" className="hover:text-gray-900 transition-colors">Contact Support</a>
          </div>

        </div>
      </footer>

    </div>
  );
}
