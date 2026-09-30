/*
 * What ComplianceWatch says, and when: the notification service's WhatsApp
 * templates (services/notification/src/notification/domain/templates.py),
 * its delivery policy (policy.py, preferences.py, channels.py) and the
 * WhatsApp bot's keywords and replies (apps/whatsapp-bot/src/consent.ts,
 * replies.ts). Copy is verbatim; the Hindi is the project's own draft.
 */

export type Lang = "en" | "hi";

/** Month names as messages spell dates: "21 Apr 2026", "21 अप्रैल 2026". */
export const MONTHS: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
};

/** WhatsApp templates, with their {placeholders}. */
export const TEMPLATES = {
  deadline_extended: {
    en: "Due date extended for {business_name}: {title} was due on {previous_due_date} and is now due on {new_due_date}. Source: {source_ref}. Reply HELP for help or STOP to opt out.",
    hi: "सूचना: {business_name} के लिए {title} की अंतिम तिथि {previous_due_date} से बढ़ाकर {new_due_date} कर दी गई है। स्रोत: {source_ref}। मदद के लिए HELP और बंद करने के लिए STOP लिखें।",
  },
  due_soon: {
    en: "{business_name}: {title} is due on {due_date}. Steps: {steps}. Reply HELP for help or STOP to opt out.",
    hi: "{business_name}: {title} की अंतिम तिथि {due_date} है। चरण: {steps}। मदद के लिए HELP और बंद करने के लिए STOP लिखें।",
  },
} as const satisfies Record<string, Record<Lang, string>>;

export type TemplateKey = keyof typeof TEMPLATES;

/** Delivery policy defaults, in minutes of the day in IST where a time. */
export const DELIVERY = {
  quietStart: 21 * 60,
  quietEnd: 8 * 60,
  /** Meta's customer service window: free text only within 24 hours of the person's last message. */
  sessionHours: 24,
  /** Notifications to one person within this window go out as one summary. */
  batchSeconds: 300,
  /** Waits after the first and second failed attempts; the third failure falls back. */
  backoffSeconds: [60, 300],
  maxAttempts: 3,
  digestAt: 9 * 60,
} as const;

/** The bot's keywords, matched on the whole message after trimming and dropping punctuation. */
export const KEYWORDS = {
  opt_out: ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "BAND", "BAND KARO", "BANDH", "रोकें", "रोको", "बंद", "बंद करो"],
  opt_in: ["START", "JOIN", "SUBSCRIBE", "YES", "HAAN", "HAN", "SHURU", "SHURU KARO", "हाँ", "हां", "शुरू", "शुरू करो"],
  help: ["HELP", "MADAD", "मदद", "SAHAYATA", "सहायता"],
} as const;

export type Intent = keyof typeof KEYWORDS | "message";

export const REPLIES: Record<Exclude<Intent, "message"> | "not_connected", Record<Lang, string>> = {
  opt_in: {
    en: "You will now receive ComplianceWatch reminders on WhatsApp. Reply STOP at any time to opt out.",
    hi: "अब आपको ComplianceWatch की याद दिलाने वाली सूचनाएँ WhatsApp पर मिलेंगी। बंद करने के लिए कभी भी STOP लिखें।",
  },
  opt_out: {
    en: "You will not receive further ComplianceWatch messages on WhatsApp. Reply START to opt in again.",
    hi: "अब आपको ComplianceWatch के संदेश WhatsApp पर नहीं मिलेंगे। फिर से शुरू करने के लिए START लिखें।",
  },
  help: {
    en: "ComplianceWatch sends GST reminders for your business. Reply START to receive them, STOP to opt out, or ask a question about a filing.",
    hi: "ComplianceWatch आपके व्यवसाय के लिए GST की याद दिलाता है। पाने के लिए START, बंद करने के लिए STOP लिखें, या किसी फाइलिंग के बारे में पूछें।",
  },
  not_connected: {
    en: "Questions are not answered on WhatsApp yet. Reply HELP for what this number can do.",
    hi: "अभी WhatsApp पर प्रश्नों के उत्तर नहीं दिए जाते। यह नंबर क्या कर सकता है, जानने के लिए HELP लिखें।",
  },
};

/** The llm-gateway's routes (domain/routing.py): a primary and a fallback per feature. */
export const ROUTES = [
  { feature: "extraction", primary: "deepseek/deepseek-v4-pro-0813", fallback: "zai/glm-5.3", timeout: 120 },
  { feature: "qa", primary: "deepseek/deepseek-v4.1-flash", fallback: "google/gemini-3.1-flash-lite", timeout: 8 },
  { feature: "retrieval", primary: "voyage/voyage-3.5-lite", fallback: null, timeout: 15 },
] as const;

export const BUDGET = {
  /** Rupees per tenant per month. */
  tenantMonthly: 1500,
  /** Rupees per feature per month. */
  featureMonthly: 20000,
  /** Share of a budget at which the alarm fires. */
  alarmAt: 0.8,
  /** Consecutive failures that open a route's circuit breaker, and for how long. */
  breakerFailures: 3,
  breakerSeconds: 60,
} as const;

/** A message a CA might paste into a question, with every kind of identifier the gateway masks. */
export const PII_SAMPLE =
  "Hi, I'm Ravi from Acme Traders (GSTIN 29ABCDE1234F1Z5, PAN ABCDE1234F). My Aadhaar is 2345 6789 0123. Call +91 98765 43210 or 9876543210, or write to ravi@acmetraders.in. Invoice 12345 67890 came to ₹12,45,000 on 14-09-2026.";
