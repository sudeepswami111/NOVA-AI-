export const DOCUMENTS = [
  {
    id: 'doc-001',
    section: 'Product Documentation — Getting Started',
    content: 'To reset your password, go to the login page and click "Forgot Password". Enter your registered email and you will receive a reset link within 5 minutes.',
    keywords: ['reset', 'password', 'forgot', 'login', 'access'],
  },
  {
    id: 'doc-002',
    section: 'Product Documentation — Account Management',
    content: 'To update your billing information, navigate to Settings > Billing > Payment Methods. You can add, remove, or update credit/debit cards at any time.',
    keywords: ['billing', 'payment', 'card', 'update', 'credit'],
  },
  {
    id: 'doc-003',
    section: 'Product Documentation — Integrations',
    content: 'We support integrations with Slack, Google Workspace, Zoom, Jira, and Salesforce. Integration guides are available under Settings > Integrations.',
    keywords: ['integration', 'slack', 'google', 'zoom', 'jira', 'salesforce', 'connect'],
  },
  {
    id: 'doc-004',
    section: 'Product Documentation — API',
    content: 'API keys can be generated from Settings > Developer > API Keys. Keys are scoped per workspace. Rate limits: 1000 requests/minute on Pro, 5000/minute on Enterprise.',
    keywords: ['api', 'key', 'developer', 'rate limit', 'request'],
  },
  {
    id: 'doc-005',
    section: 'Product Documentation — Data Export',
    content: 'You can export your data in CSV or JSON format from Settings > Data > Export. Exports are processed within 1 hour and sent to your registered email.',
    keywords: ['export', 'data', 'download', 'csv', 'json', 'backup'],
  },
];

export const FAQS = [
  {
    id: 'faq-001',
    section: 'FAQ — Refund Policy',
    content: 'We offer a 14-day money-back guarantee on all plans. Refunds are processed within 5–7 business days back to the original payment method. Annual plans that have passed 14 days are non-refundable.',
    keywords: ['refund', 'money back', 'cancel', 'return', 'charge'],
  },
  {
    id: 'faq-002',
    section: 'FAQ — Pricing',
    content: 'Plans: Free ($0/mo, up to 3 users), Pro ($29/mo, up to 25 users), Enterprise (custom pricing, unlimited users). Annual billing gives 2 months free.',
    keywords: ['pricing', 'plan', 'cost', 'price', 'how much', 'subscription', 'tier'],
  },
  {
    id: 'faq-003',
    section: 'FAQ — Downtime & Outages',
    content: 'Service status is available at status.company.com. During an active outage our SRE team is automatically alerted. Enterprise customers receive direct incident notifications.',
    keywords: ['down', 'outage', 'not working', 'offline', 'status', 'unavailable'],
  },
  {
    id: 'faq-004',
    section: 'FAQ — Data Security',
    content: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II and GDPR compliant. Penetration tests are run quarterly.',
    keywords: ['security', 'encrypted', 'gdpr', 'soc2', 'compliance', 'data', 'privacy'],
  },
  {
    id: 'faq-005',
    section: 'FAQ — Account Deletion',
    content: 'To permanently delete your account, go to Settings > Account > Delete Account. This action is irreversible. Data is purged within 30 days per our retention policy.',
    keywords: ['delete', 'account', 'remove', 'close', 'deactivate'],
  },
  {
    id: 'faq-006',
    section: 'FAQ — Team & Seats',
    content: 'You can invite team members from Settings > Team > Invite. Removing a member frees up a seat immediately. Seat changes on annual plans are prorated.',
    keywords: ['team', 'invite', 'member', 'seat', 'user', 'add'],
  },
];

// Simulate a ticket ID generator
let ticketCounter = 1000;
export function generateTicketId() {
  return `TKT-${++ticketCounter}`;
}

export function getPriority(query) {
  const low = ['how', 'what', 'guide', 'feature', 'where', 'export', 'invite'];
  const high = ['outage', 'down', 'security', 'breach', 'data loss', 'not working', 'hack'];
  const q = query.toLowerCase();
  if (high.some(k => q.includes(k))) return 'High';
  if (low.some(k => q.includes(k))) return 'Low';
  return 'Medium';
}

export function searchDocuments(query) {
  const q = query.toLowerCase();
  const scored = DOCUMENTS.map(doc => ({
    ...doc,
    score: doc.keywords.filter(k => q.includes(k)).length,
  })).filter(d => d.score > 0).sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

export function searchFaq(query) {
  const q = query.toLowerCase();
  const scored = FAQS.map(faq => ({
    ...faq,
    score: faq.keywords.filter(k => q.includes(k)).length,
  })).filter(d => d.score > 0).sort((a, b) => b.score - a.score);
  return scored[0] || null;
}
