import { CalculatorInputs, CalculatorOutputs } from "../types";

/**
 * Performs all commercial insurance premium gap calculations with high numeric precision.
 */
export function calculatePremiumGap(inputs: CalculatorInputs): CalculatorOutputs {
  const {
    renewalPremium,
    downPaymentPercent,
    cashAvailable,
    termMonths,
    knownFinanceCharges,
  } = inputs;

  // Ensure safe numeric values to prevent division by zero or NaN issues
  const safePremium = Math.max(0, renewalPremium);
  const safeDownPaymentPct = Math.min(100, Math.max(0, downPaymentPercent)) / 100;
  const safeCashAvailable = Math.max(0, cashAvailable);
  const safeTermMonths = Math.max(1, termMonths);
  const safeFinanceCharges = Math.max(0, knownFinanceCharges);

  // 1. Calculate Required Down Payment
  const requiredDownPayment = safePremium * safeDownPaymentPct;

  // 2. Calculate Down Payment Gap & Surplus
  const downPaymentGap = Math.max(requiredDownPayment - safeCashAvailable, 0);
  const downPaymentSurplus = Math.max(safeCashAvailable - requiredDownPayment, 0);

  // 3. Calculate Premium Finance Balance (The balance of the premium that gets financed)
  const premiumFinanceBalance = Math.max(safePremium - requiredDownPayment, 0);

  // 4. Calculate Estimated Financed Total (Premium Balance + known charges/fees)
  const estimatedFinancedTotal = premiumFinanceBalance + safeFinanceCharges;

  // 5. Calculate Estimated Monthly Installment
  const estimatedMonthlyInstallment = estimatedFinancedTotal / safeTermMonths;

  // 6. Calculate Percentages for Visual Displays
  const gapAsPercentOfPremium = safePremium > 0 ? (downPaymentGap / safePremium) * 100 : 0;
  const gapAsPercentOfRequiredDownPayment =
    requiredDownPayment > 0 ? (downPaymentGap / requiredDownPayment) * 100 : 0;

  return {
    requiredDownPayment,
    downPaymentGap,
    downPaymentSurplus,
    premiumFinanceBalance,
    estimatedFinancedTotal,
    estimatedMonthlyInstallment,
    gapAsPercentOfPremium,
    gapAsPercentOfRequiredDownPayment,
  };
}

/**
 * Format helper for currency values (USD default).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Simple validation checks for fields.
 * Returns an object with key-value pairs of error messages.
 */
export function validateInputs(inputs: CalculatorInputs): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!inputs.renewalPremium || inputs.renewalPremium <= 0) {
    errors.renewalPremium = "Please enter a valid premium amount greater than $0.";
  }

  if (inputs.downPaymentPercent < 0 || inputs.downPaymentPercent > 100) {
    errors.downPaymentPercent = "Down payment percentage must be between 0% and 100%.";
  }

  if (inputs.cashAvailable < 0) {
    errors.cashAvailable = "Available cash cannot be less than $0.";
  }

  if (inputs.cashAvailable > inputs.renewalPremium) {
    errors.cashAvailable = "Available cash cannot exceed the total premium amount.";
  }

  if (!inputs.termMonths || inputs.termMonths < 1 || inputs.termMonths > 24) {
    errors.termMonths = "Term length must be between 1 and 24 months.";
  }

  if (inputs.knownFinanceCharges < 0) {
    errors.knownFinanceCharges = "Finance charges cannot be less than $0.";
  }

  return errors;
}

/**
 * Emits lightweight tracking events for system analytics.
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // Console log in development mode
  console.log(`[Analytics Event] ${eventName}`, properties || "");

  try {
    // Push to standard Google Tag Manager dataLayer if available
    const dataLayer = (window as any).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({
        event: eventName,
        ...properties,
      });
    }

    // Call standard global callback if registered
    const customCallback = (window as any).onPfgAnalyticsEvent;
    if (typeof customCallback === "function") {
      customCallback(eventName, properties);
    }
  } catch (e) {
    console.error("Failed to emit analytics event", e);
  }
}
