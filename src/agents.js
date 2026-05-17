export const AGENTS = [
  {
    id: 'support',
    name: 'Support Agent',
    icon: '🎧',
    color: '#63b3ed',
    glow: 'rgba(99,179,237,0.2)',
    description: 'Answers customer questions using internal documents, FAQs, and past tickets',
    keywords: ['support', 'help', 'question', 'issue', 'problem', 'customer', 'faq', 'ticket', 'error', 'fix', 'broken'],
  },
  {
    id: 'meeting',
    name: 'Meeting Agent',
    icon: '📅',
    color: '#68d391',
    glow: 'rgba(104,211,145,0.2)',
    description: 'Reads email meeting requests, checks calendar availability, and drafts replies',
    keywords: ['meeting', 'calendar', 'schedule', 'availability', 'invite', 'call', 'zoom', 'appointment', 'book', 'slot', 'time', 'email'],
  },
  {
    id: 'research',
    name: 'Research Agent',
    icon: '🔍',
    color: '#b794f4',
    glow: 'rgba(183,148,244,0.2)',
    description: 'Searches the web for competitor updates and produces structured summaries',
    keywords: ['research', 'competitor', 'market', 'search', 'web', 'find', 'look up', 'analyze', 'trend', 'news', 'report'],
  },
  {
    id: 'pdf',
    name: 'PDF Agent',
    icon: '📄',
    color: '#f6ad55',
    glow: 'rgba(246,173,85,0.2)',
    description: 'Reads uploaded PDFs and extracts summaries, action items, and deadlines',
    keywords: ['pdf', 'document', 'file', 'upload', 'read', 'extract', 'summarize', 'action items', 'deadline', 'report', 'contract'],
  },
  {
    id: 'social',
    name: 'Social Media Agent',
    icon: '📱',
    color: '#fc8181',
    glow: 'rgba(252,129,129,0.2)',
    description: 'Writes platform-specific content drafts from a content brief',
    keywords: ['social', 'post', 'tweet', 'linkedin', 'instagram', 'facebook', 'content', 'caption', 'hashtag', 'draft', 'publish'],
  },
];

const APPROVAL_REQUIRED = [
  'send an email', 'sending an email',
  'create a calendar event', 'modify a calendar event',
  'delete', 'deleting',
  'update a crm', 'crm record',
  'invoice', 'payment',
  'publish', 'publishing',
  'public slack',
];

export function detectApprovalNeeded(text) {
  const lower = text.toLowerCase();
  return APPROVAL_REQUIRED.some(k => lower.includes(k));
}

export function routeMessage(text) {
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const agent of AGENTS) {
    let score = 0;
    for (const kw of agent.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) { bestScore = score; best = agent; }
  }

  return best;
}

export function buildHandoff(agent, userMessage) {
  const needsApproval = detectApprovalNeeded(userMessage);
  return {
    agent,
    taskSummary: `Route the following request to ${agent.name}: "${userMessage.slice(0, 120)}${userMessage.length > 120 ? '…' : ''}"`,
    keyInputs: [`User message: "${userMessage}"`, `Current time: ${new Date().toLocaleString()}`],
    missingInputs: getMissingInputs(agent, userMessage),
    requiresApproval: needsApproval,
    approvalReason: needsApproval ? 'This task involves a sensitive action that requires human approval before execution.' : null,
  };
}

function getMissingInputs(agent, text) {
  const missing = [];
  const lower = text.toLowerCase();

  if (agent.id === 'meeting') {
    if (!lower.includes('@') && !lower.includes('email')) missing.push('Email thread or sender details');
    if (!lower.match(/\d{1,2}(:\d{2})?\s?(am|pm)/i) && !lower.includes('tomorrow') && !lower.includes('monday')) missing.push('Preferred date/time range');
  }
  if (agent.id === 'research') {
    if (!lower.includes('http') && !lower.includes('company') && !lower.includes('competitor')) missing.push('Specific company name or URL to research');
  }
  if (agent.id === 'pdf') {
    if (!lower.includes('pdf') && !lower.includes('attached') && !lower.includes('file')) missing.push('PDF file upload');
  }
  if (agent.id === 'social') {
    if (!lower.includes('twitter') && !lower.includes('linkedin') && !lower.includes('instagram') && !lower.includes('facebook')) missing.push('Target platform(s)');
    if (!lower.includes('brief') && text.length < 80) missing.push('Full content brief or key message');
  }

  return missing.length ? missing : ['None — all inputs available'];
}
