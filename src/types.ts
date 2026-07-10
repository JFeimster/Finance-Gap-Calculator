export interface CalculatorInputs {
  renewalPremium: number;
  downPaymentPercent: number; // e.g., 25 for 25%
  cashAvailable: number;
  termMonths: number;
  knownFinanceCharges: number;
  renewalEffectiveDate: string;
  policyType: string;
}

export interface CalculatorOutputs {
  requiredDownPayment: number;
  downPaymentGap: number;
  downPaymentSurplus: number;
  premiumFinanceBalance: number;
  estimatedFinancedTotal: number;
  estimatedMonthlyInstallment: number;
  gapAsPercentOfPremium: number;
  gapAsPercentOfRequiredDownPayment: number;
}

export interface AppConfig {
  brandName: string;
  logoUrl: string;
  primaryCtaLabel: string;
  leadEndpoint: string;
  tallyFallbackUrl: string;
  defaultPartnerId: string;
  privacyUrl: string;
  accentColor: string;
  successRedirectUrl: string;
  debug: boolean;
}

export interface AttributionData {
  partnerId: string;
  agencyName: string;
  ref: string;
  source: string;
  campaign: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  pageUrl: string;
}

export interface LeadPayload extends CalculatorInputs, CalculatorOutputs, AttributionData {
  leadType: string;
  sourceTool: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  agentName: string;
  agentEmail: string;
  notes: string;
  consent: boolean;
  submittedAt: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}
