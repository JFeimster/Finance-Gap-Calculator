import React, { useState } from "react";
import { CalculatorInputs, CalculatorOutputs } from "../types";
import { formatCurrency, trackEvent } from "../utils/calculations";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight,
  Info,
  CalendarDays
} from "lucide-react";

interface ResultViewProps {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  primaryCtaLabel: string;
  onReferralTrigger: () => void;
  accentColor: string;
}

export default function ResultView({ 
  inputs, 
  outputs, 
  primaryCtaLabel, 
  onReferralTrigger, 
  accentColor 
}: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const {
    requiredDownPayment,
    downPaymentGap,
    downPaymentSurplus,
    premiumFinanceBalance,
    estimatedFinancedTotal,
    estimatedMonthlyInstallment,
    gapAsPercentOfPremium,
    gapAsPercentOfRequiredDownPayment,
  } = outputs;

  // Determine date relationships
  const getDaysUntilRenewal = (): { days: number; isPast: boolean; label: string } | null => {
    if (!inputs.renewalEffectiveDate) return null;
    
    const today = new Date("2026-07-09"); // Hardcoded base or standard new Date()
    const target = new Date(inputs.renewalEffectiveDate);
    
    // Clear times for direct day calculation
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { days: 0, isPast: false, label: "Effective today!" };
    } else if (diffDays < 0) {
      return { days: Math.abs(diffDays), isPast: true, label: `Passed ${Math.abs(diffDays)} days ago` };
    } else {
      return { days: diffDays, isPast: false, label: `${diffDays} days remaining` };
    }
  };

  const dateInfo = getDaysUntilRenewal();

  // Determine current display State
  // State 4: Renewal date has passed
  const isDatePast = dateInfo?.isPast || false;

  // State 1: Down payment covered
  // State 2: Partial down-payment gap
  // State 3: Full down-payment gap
  const isCovered = downPaymentGap === 0;
  const isPartialGap = downPaymentGap > 0 && inputs.cashAvailable > 0;
  const isFullGap = downPaymentGap > 0 && inputs.cashAvailable === 0;

  // Calculate percentage of down payment covered
  const percentCovered = requiredDownPayment > 0 
    ? Math.min(100, Math.max(0, (inputs.cashAvailable / requiredDownPayment) * 100))
    : 0;

  // Prepare Copy-to-Clipboard Summary
  const handleCopySummary = async () => {
    const summaryText = `Commercial Insurance Renewal Gap Summary

Total Renewal Premium: ${formatCurrency(inputs.renewalPremium)}
Required Down Payment: ${formatCurrency(requiredDownPayment)} (${inputs.downPaymentPercent}%)
Cash Currently Available: ${formatCurrency(inputs.cashAvailable)}
Immediate Down-Payment Gap: ${formatCurrency(downPaymentGap)}
Remaining Premium Balance: ${formatCurrency(premiumFinanceBalance)}
Estimated Monthly Installment: ${formatCurrency(estimatedMonthlyInstallment)}
Term: ${inputs.termMonths} Months
Finance Charges Entered: ${formatCurrency(inputs.knownFinanceCharges)}
Renewal Effective Date: ${inputs.renewalEffectiveDate || "Not provided"}
Policy Type: ${inputs.policyType || "Not provided"}

This is an educational estimate and not an insurance or financing quote.`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      trackEvent("pfg_copy_summary", { 
        premium: inputs.renewalPremium, 
        gap: downPaymentGap,
        partner_id: sessionStorage.getItem("pfg_partner_id") 
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handlePrint = () => {
    trackEvent("pfg_print_summary", { premium: inputs.renewalPremium, gap: downPaymentGap });
    window.print();
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 flex flex-col justify-between h-full relative overflow-hidden" id="pfg-results-card">
      
      {/* Decorative colored glow bar at the top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ 
          backgroundColor: isCovered 
            ? "#10B981" // Emerald
            : isPartialGap 
              ? "#F59E0B" // Amber
              : "#EF4444" // Red
        }}
      />

      <div className="space-y-5">
        
        {/* Header Indicator / Heading State */}
        <div className="flex items-start gap-3">
          {isCovered && (
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
          )}
          {isPartialGap && (
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
          )}
          {isFullGap && (
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertOctagon className="h-6 w-6" />
            </div>
          )}

          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Analysis Result</span>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
              {isCovered && "The required down payment appears covered."}
              {isPartialGap && "This renewal has an upfront cash gap."}
              {isFullGap && "The full down payment still needs a funding plan."}
            </h3>
          </div>
        </div>

        {/* Date Alert for Past Date */}
        {isDatePast && (
          <div className="bg-red-50/70 border border-red-100 text-red-800 text-xs rounded-xl p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Attention Required:</span> The entered renewal date has passed ({dateInfo?.label}). Confirm whether coverage is still active or whether a reinstatement path is available.
            </div>
          </div>
        )}

        {/* Date indicator for future date */}
        {!isDatePast && dateInfo && (
          <div className="bg-teal-50 border border-teal-100 text-teal-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-teal-600 shrink-0" />
            <span>Renewal is scheduled in <strong className="font-semibold">{dateInfo.days} days</strong> ({inputs.renewalEffectiveDate}).</span>
          </div>
        )}

        {/* The Dominant Visual Number */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs text-center md:text-left">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {isCovered ? "Upfront Surplus / Extra Capital" : "Immediate Down Payment Gap"}
          </p>
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mt-1 justify-center md:justify-start">
            <span 
              className="text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ 
                color: isCovered 
                  ? "#10B981" 
                  : isPartialGap 
                    ? "#D97706" 
                    : "#DC2626" 
              }}
            >
              {formatCurrency(isCovered ? downPaymentSurplus : downPaymentGap)}
            </span>
            {!isCovered && (
              <span className="text-xs text-gray-400 font-normal">
                ({gapAsPercentOfRequiredDownPayment.toFixed(0)}% of required down payment)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isCovered 
              ? "The business has more available cash than the minimum required down payment." 
              : `The business needs an additional ${formatCurrency(downPaymentGap)} upfront cash to bind coverage.`}
          </p>
        </div>

        {/* Stacked comparison Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>Down Payment Funding Breakdown</span>
            <span>Total Needed: {formatCurrency(requiredDownPayment)}</span>
          </div>
          
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
            {/* Cash portion */}
            {percentCovered > 0 && (
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${percentCovered}%` }}
                title={`Available Cash: ${formatCurrency(inputs.cashAvailable)}`}
              />
            )}
            {/* Gap portion */}
            {!isCovered && (
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${100 - percentCovered}%` }}
                title={`Gap: ${formatCurrency(downPaymentGap)}`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
              Cash Available ({percentCovered.toFixed(0)}%)
            </span>
            {!isCovered && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm inline-block" />
                Immediate Gap ({(100 - percentCovered).toFixed(0)}%)
              </span>
            )}
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          
          <div className="bg-white/50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Required Down Payment</span>
            <span className="text-sm font-bold text-gray-800 block mt-0.5">{formatCurrency(requiredDownPayment)}</span>
            <span className="text-[10px] text-gray-500 block">{inputs.downPaymentPercent}% of premium</span>
          </div>

          <div className="bg-white/50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Remaining Premium</span>
            <span className="text-sm font-bold text-gray-800 block mt-0.5">{formatCurrency(premiumFinanceBalance)}</span>
            <span className="text-[10px] text-gray-500 block">Eligible to finance</span>
          </div>

          <div className="bg-white/50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Estimated Installment</span>
            <span className="text-sm font-bold text-gray-800 block mt-0.5">{formatCurrency(estimatedMonthlyInstallment)}</span>
            <span className="text-[10px] text-gray-500 block">
              {inputs.knownFinanceCharges > 0 ? "Incl. known charges" : "Before unknown charges"}
            </span>
          </div>

          <div className="bg-white/50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Finance Term</span>
            <span className="text-sm font-bold text-gray-800 block mt-0.5">{inputs.termMonths} Months</span>
            <span className="text-[10px] text-gray-500 block">Monthly payments</span>
          </div>

        </div>

        {/* Estimate Disclosure warning */}
        <p className="text-[10px] text-gray-400 leading-relaxed pt-1.5 border-t border-gray-200/50">
          <strong>Planning Estimate only:</strong> This calculator provides an educational estimate based on the information entered. It is not an insurance quote, financing offer, approval, commitment, or recommendation. Actual premium-finance requirements, charges, terms, and eligibility vary by provider.
        </p>

      </div>

      {/* Primary and Secondary Action Buttons */}
      <div className="space-y-3 mt-6 pt-4 border-t border-gray-200/50">
        
        {/* Primary CTA Button */}
        <button
          onClick={onReferralTrigger}
          className="w-full text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer"
          style={{ backgroundColor: accentColor }}
          id="btn-primary-cta"
        >
          <span>{isCovered ? "Review Capital Options" : primaryCtaLabel}</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>

        {/* Copy / Print Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          
          <button
            onClick={handleCopySummary}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
            id="btn-copy-summary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 animate-scaleIn" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-gray-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
            id="btn-print-summary"
          >
            <Printer className="h-3.5 w-3.5 text-gray-400" />
            <span>Print Results</span>
          </button>

        </div>

      </div>

    </div>
  );
}
