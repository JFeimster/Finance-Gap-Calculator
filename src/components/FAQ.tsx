import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is this a binding insurance quote or a formal financing offer?",
    answer: "No. This tool is strictly an educational planning calculator designed to quantify upfront capital gaps. It does not perform underwriting, check credit, query banking records, or guarantee that any specific insurance program or premium finance term will be approved or bound."
  },
  {
    question: "Can producers use this tool in direct conversations with clients?",
    answer: "Absolutely. Producers and account managers can use the calculator during phone reviews, video consults, or face-to-face meetings to help insureds evaluate cash flow. Once a down-payment gap is identified, the agent can enter client details and submit a referral directly to initiate custom terms triage."
  },
  {
    question: "How do I embed this calculator on my agency website or client portal?",
    answer: "We support both simple HTML iframe integration and advanced direct script loaders (embed.js). Go to the 'Embed Code Generator' tab or section below to customize your brand accent color, agency partner ID, and instantly copy the snippet for your system."
  },
  {
    question: "What happens if our agency doesn't have a customized REST API lead endpoint?",
    answer: "By default, the form automatically falls back to our certified secure Tally intake engine. It prepopulates all client data and financial figures so no information is lost, allowing you to instantly secure a rescue referral review even with zero custom technical configuration."
  },
  {
    question: "Is client data (PII) saved or shared by the calculator?",
    answer: "No. We do not store any Personally Identifiable Information (PII) like names, emails, phone numbers, or notes in local or session storage. Only neutral numbers (premium, percentage, term), selected policy type, and anonymous campaign parameters are cached locally to support fast browser refreshes."
  },
  {
    question: "Can this calculator be co-branded with custom agency colors?",
    answer: "Yes. Using URL parameters (e.g., `?brand_name=Acme%20Insurance&accent=%23ff5500`), you can instantly load the tool with your logo name and unique visual identity, ideal for sending targeted links directly in renewal email sequences."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6" id="pfg-faq-section">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
        <HelpCircle className="h-5 w-5 text-teal-600 shrink-0" />
        <h3 className="text-lg font-semibold text-gray-950 tracking-tight">Agent & Partner FAQs</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left font-medium text-sm text-gray-900 hover:text-teal-600 transition-colors focus:outline-none py-1"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {isOpen && (
                <div className="mt-2.5 text-xs text-gray-500 leading-relaxed pl-1 animate-fadeIn">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
