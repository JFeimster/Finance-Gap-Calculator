import React, { useState } from "react";
import { CalculatorInputs } from "../types";
import { validateInputs } from "../utils/calculations";
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Briefcase,
  AlertCircle
} from "lucide-react";

interface CalculatorProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
  onReset: () => void;
  accentColor: string;
}

export default function Calculator({ inputs, onChange, onReset, accentColor }: CalculatorProps) {
  const [showOptional, setShowOptional] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    let parsedValue = value;
    
    // Parse numeric fields properly
    if (field === "renewalPremium" || field === "cashAvailable" || field === "knownFinanceCharges") {
      // Allow decimals but handle blank input as 0
      parsedValue = value === "" ? 0 : parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (field === "downPaymentPercent" || field === "termMonths") {
      parsedValue = value === "" ? 0 : parseInt(value, 10);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    const updatedInputs = {
      ...inputs,
      [field]: parsedValue,
    };

    // Run validation checks on changes
    const validationErrors = validateInputs(updatedInputs);
    setLocalErrors(validationErrors);
    
    onChange(updatedInputs);
  };

  const handlePresetPercent = (pct: number) => {
    handleInputChange("downPaymentPercent", pct);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6" id="pfg-calculator-container">
      <div className="flex justify-between items-center pb-4 border-b border-gray-50">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Renewal Parameters</h2>
          <p className="text-xs text-gray-500 mt-1">Enter figures from the renewal quote or policy package.</p>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
          id="btn-reset"
        >
          Reset values
        </button>
      </div>

      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Total Renewal Premium */}
        <div className="space-y-2">
          <label htmlFor="renewalPremium" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Total Renewal Premium</span>
            <span className="text-xs text-gray-400">Required</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              name="renewalPremium"
              id="renewalPremium"
              min="1"
              step="any"
              placeholder="100,000"
              value={inputs.renewalPremium || ""}
              onChange={(e) => handleInputChange("renewalPremium", e.target.value)}
              className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                localErrors.renewalPremium 
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500"
              }`}
              style={{ borderColor: localErrors.renewalPremium ? "" : inputs.renewalPremium > 0 ? accentColor : "" }}
            />
          </div>
          {localErrors.renewalPremium ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {localErrors.renewalPremium}</p>
          ) : (
            <p className="text-xs text-gray-400">Enter the full annual premium amount.</p>
          )}
        </div>

        {/* Required Down Payment % */}
        <div className="space-y-2">
          <label htmlFor="downPaymentPercent" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Required Down Payment</span>
            <span className="text-xs text-gray-400">Default: 25%</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Percent className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              name="downPaymentPercent"
              id="downPaymentPercent"
              min="0"
              max="100"
              placeholder="25"
              value={inputs.downPaymentPercent ?? ""}
              onChange={(e) => handleInputChange("downPaymentPercent", e.target.value)}
              className={`block w-full rounded-xl border py-3 pl-10 pr-16 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                localErrors.downPaymentPercent 
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500"
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              <button
                type="button"
                onClick={() => handlePresetPercent(20)}
                className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                20%
              </button>
              <button
                type="button"
                onClick={() => handlePresetPercent(25)}
                className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handlePresetPercent(30)}
                className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                30%
              </button>
            </div>
          </div>
          {localErrors.downPaymentPercent ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {localErrors.downPaymentPercent}</p>
          ) : (
            <p className="text-xs text-gray-400">Required percentage needed to bind/activate the policy.</p>
          )}
        </div>

        {/* Cash Available for Down Payment */}
        <div className="space-y-2">
          <label htmlFor="cashAvailable" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Cash Available for Down Payment</span>
            <span className="text-xs text-gray-400">Required</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              name="cashAvailable"
              id="cashAvailable"
              min="0"
              step="any"
              placeholder="10,000"
              value={inputs.cashAvailable === 0 ? "0" : inputs.cashAvailable || ""}
              onChange={(e) => handleInputChange("cashAvailable", e.target.value)}
              className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                localErrors.cashAvailable 
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500"
              }`}
            />
          </div>
          {localErrors.cashAvailable ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {localErrors.cashAvailable}</p>
          ) : (
            <p className="text-xs text-gray-400">How much upfront cash the business has available right now.</p>
          )}
        </div>

        {/* Premium Finance Term */}
        <div className="space-y-2">
          <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Financing Term (Installments)</span>
            <span className="text-xs text-gray-400">Default: 10 months</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <select
              name="termMonths"
              id="termMonths"
              value={inputs.termMonths}
              onChange={(e) => handleInputChange("termMonths", e.target.value)}
              className={`block w-full rounded-xl border py-3 pl-4 pr-10 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                localErrors.termMonths 
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500"
              }`}
            >
              <option value="1">1 Month (No financing)</option>
              <option value="4">4 Months</option>
              <option value="6">6 Months</option>
              <option value="8">8 Months</option>
              <option value="9">9 Months</option>
              <option value="10">10 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
              <option value="24">24 Months</option>
            </select>
          </div>
          {localErrors.termMonths ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {localErrors.termMonths}</p>
          ) : (
            <p className="text-xs text-gray-400">Number of monthly payments for the remaining balance.</p>
          )}
        </div>

      </div>

      {/* Collapsible Optional Renewal Details */}
      <div className="border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors focus:outline-none"
          id="btn-toggle-optional"
        >
          {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>Optional Renewal Details</span>
          <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full font-normal">
            Configure dates, charges, policy type
          </span>
        </button>

        {showOptional && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-1 animate-fadeIn">
            
            {/* Known Finance Charges */}
            <div className="space-y-2">
              <label htmlFor="knownFinanceCharges" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>Finance Charges / Fees</span>
                <span className="text-xs text-gray-400">Optional</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="knownFinanceCharges"
                  id="knownFinanceCharges"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={inputs.knownFinanceCharges || ""}
                  onChange={(e) => handleInputChange("knownFinanceCharges", e.target.value)}
                  className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                    localErrors.knownFinanceCharges 
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                      : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-400">Enter if you have a premium finance quote estimate.</p>
            </div>

            {/* Renewal Effective Date */}
            <div className="space-y-2">
              <label htmlFor="renewalEffectiveDate" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>Renewal Effective Date</span>
                <span className="text-xs text-gray-400">Optional</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="renewalEffectiveDate"
                  id="renewalEffectiveDate"
                  value={inputs.renewalEffectiveDate}
                  onChange={(e) => handleInputChange("renewalEffectiveDate", e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm transition-all"
                />
              </div>
              <p className="text-xs text-gray-400">Provides date alerts for deadline urgency.</p>
            </div>

            {/* Policy Type */}
            <div className="space-y-2">
              <label htmlFor="policyType" className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>Policy Type / Line of Biz</span>
                <span className="text-xs text-gray-400">Optional</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="policyType"
                  id="policyType"
                  value={inputs.policyType}
                  onChange={(e) => handleInputChange("policyType", e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm transition-all"
                >
                  <option value="">-- Select Policy Type --</option>
                  <option value="General Liability">General Liability</option>
                  <option value="Commercial Auto">Commercial Auto</option>
                  <option value="Workers' Compensation">Workers' Compensation</option>
                  <option value="Commercial Property">Commercial Property</option>
                  <option value="Professional Liability">Professional Liability / E&O</option>
                  <option value="Cyber Insurance">Cyber Liability</option>
                  <option value="Commercial Package">Commercial Package Policy</option>
                  <option value="Excess / Umbrella">Excess / Umbrella</option>
                  <option value="Other">Other Policy Type</option>
                </select>
              </div>
              <p className="text-xs text-gray-400">Helps with partner underwriting triage.</p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
