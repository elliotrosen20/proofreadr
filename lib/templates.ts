export interface Template {
  id: string
  title: string
  category: string
  description: string
  content: string
  icon: string
}

export const templates: Template[] = [
  {
    id: 'cold-email-initial',
    title: 'Cold Email - Initial Outreach',
    category: 'Prospecting',
    description: 'Professional cold email template for first contact',
    content: `<p>Hi [Name],</p>

<p>I noticed [Company] recently [trigger event]. Congratulations!</p>

<p>We help [industry] companies with [challenge]. Would a 15-minute call make sense this week?</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'Mail'
  },
  {
    id: 'linkedin-connection',
    title: 'LinkedIn Connection Request',
    category: 'Prospecting',
    description: 'Personalized LinkedIn connection request message',
    content: `<p>Hi [Name],</p>

<p>I see we both work in [industry]. I'd love to connect and share insights about [topic].</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'Users'
  },
  {
    id: 'cold-call-followup',
    title: 'Cold Call Follow-up Email',
    category: 'Prospecting',
    description: 'Follow-up email after an initial cold call',
    content: `<p>Hi [Name],</p>

<p>Thanks for taking my call today. As promised, here's the [resource] we discussed.</p>

<p>Are you available for a follow-up call next week?</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'Phone'
  },
  {
    id: 'followup-value-add',
    title: 'Follow-up #1 - Value Add',
    category: 'Follow-up',
    description: 'Value-focused follow-up with industry insights',
    content: `<p>Hi [Name],</p>

<p>I found this article about [topic] and thought of our conversation.</p>

<p><strong>[Article Title]</strong><br>
[Why it's relevant]</p>

<p>Hope this helps!</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'TrendingUp'
  },
  {
    id: 'followup-case-study',
    title: 'Follow-up #2 - Case Study',
    category: 'Follow-up',
    description: 'Follow-up featuring relevant customer success story',
    content: `<p>Hi [Name],</p>

<p>We just helped [Similar Company] achieve [result]. Given your situation, this might be relevant.</p>

<p>Interested in a brief conversation?</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'BarChart'
  },
  {
    id: 'followup-soft-close',
    title: 'Follow-up #3 - Soft Close',
    category: 'Follow-up',
    description: 'Gentle follow-up with meeting request',
    content: `<p>Hi [Name],</p>

<p>Following up on our conversation about [challenge]. Would a 20-minute call this week work?</p>

<p>I have availability on [days/times].</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'Calendar'
  },
  {
    id: 'meeting-confirmation',
    title: 'Meeting Confirmation',
    category: 'Meetings',
    description: 'Professional meeting confirmation with agenda',
    content: `<p>Hi [Name],</p>

<p>Looking forward to our call on [Date] at [Time]. Calendar invite sent.</p>

<p><strong>Meeting Details:</strong><br>
📅 [Date] at [Time]<br>
📍 [Location]</p>

<p>Let me know if you need to reschedule.</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'Calendar'
  },
  {
    id: 'meeting-followup',
    title: 'Meeting Follow-up',
    category: 'Meetings',
    description: 'Post-meeting recap with next steps',
    content: `<p>Hi [Name],</p>

<p>Thanks for our conversation today! Here's a quick recap:</p>

<p><strong>Key Points:</strong></p>
<ul>
<li>[Point 1]</li>
<li>[Point 2]</li>
</ul>

<p><strong>Next Steps:</strong><br>
I'll [action] by [date].</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'CheckSquare'
  },
  {
    id: 'proposal-email',
    title: 'Proposal Email',
    category: 'Closing',
    description: 'Professional proposal presentation email',
    content: `<p>Hi [Name],</p>

<p>Based on our conversation, here's our proposal to help you achieve [goal].</p>

<p><strong>Solution:</strong> [Brief overview]</p>

<p><strong>Investment:</strong> [Pricing]</p>

<p>Proposal attached. Available for a 15-minute call this week to discuss?</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'FileText'
  },
  {
    id: 'pricing-discussion',
    title: 'Pricing Discussion',
    category: 'Closing',
    description: 'Value-focused pricing conversation template',
    content: `<p>Hi [Name],</p>

<p>Following up on our discussion about [solution]. Here's the value breakdown:</p>

<p><strong>Your Challenge:</strong> [Pain point]</p>

<p><strong>Our Value:</strong> [Key benefit and impact]</p>

<p><strong>Investment:</strong> [Pricing options]</p>

<p>Available for a brief call to discuss?</p>

<p>Best,<br>
[Your Name]</p>`,
    icon: 'DollarSign'
  }
]

export const templateCategories = [
  'All',
  'Prospecting',
  'Follow-up',
  'Meetings',
  'Closing'
] as const

export type TemplateCategory = typeof templateCategories[number] 