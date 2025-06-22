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

<p>I noticed [Company] recently [specific trigger event - expansion, funding, new hire, etc.]. Congratulations on the growth!</p>

<p>I'm reaching out because I've been helping similar companies in [industry] streamline their [specific process/challenge] and thought you might find value in a brief conversation.</p>

<p>For example, we recently helped [Similar Company] reduce their [specific metric] by [percentage] while increasing [positive outcome].</p>

<p>Would it make sense to have a brief 15-minute conversation this week to explore how this might apply to [Company]?</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Title]<br>
[Contact Information]</p>`,
    icon: 'Mail'
  },
  {
    id: 'linkedin-connection',
    title: 'LinkedIn Connection Request',
    category: 'Prospecting',
    description: 'Personalized LinkedIn connection request message',
    content: `<p>Hi [Name],</p>

<p>I see we both work in [industry] and I've noticed your experience with [specific area of expertise]. I'd love to connect and share insights about [relevant industry topic/challenge].</p>

<p>I've been following [Company]'s growth and would be interested in your perspective on [specific industry trend or challenge].</p>

<p>Looking forward to connecting!</p>

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

<p>Thanks for taking my call earlier today. I appreciate the time you took to discuss [Company]'s current challenges with [specific area].</p>

<p>As promised, I'm attaching the [resource/case study/information] we discussed that shows how [Similar Company] achieved [specific result].</p>

<p>Key takeaways that might be relevant to [Company]:</p>
<ul>
<li>[Specific benefit 1]</li>
<li>[Specific benefit 2]</li>
<li>[Specific benefit 3]</li>
</ul>

<p>I'd be happy to discuss how this approach might work for [Company]. Are you available for a brief call next week?</p>

<p>Best regards,<br>
[Your Name]<br>
[Your Title]<br>
[Contact Information]</p>`,
    icon: 'Phone'
  },
  {
    id: 'followup-value-add',
    title: 'Follow-up #1 - Value Add',
    category: 'Follow-up',
    description: 'Value-focused follow-up with industry insights',
    content: `<p>Hi [Name],</p>

<p>I came across this article about [relevant industry trend] and immediately thought of our conversation about [specific challenge they mentioned].</p>

<p><strong>[Article Title/Resource]</strong><br>
[Brief summary of why it's relevant to them]</p>

<p>The key insight that stood out was [specific point], which directly relates to what you mentioned about [their challenge].</p>

<p>I thought you might find it valuable for your team's upcoming [project/initiative they mentioned].</p>

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

<p>I thought you'd find this interesting - we just completed a project with [Similar Company] that achieved some impressive results.</p>

<p><strong>The Challenge:</strong><br>
[Similar challenge to what the prospect faces]</p>

<p><strong>Our Solution:</strong><br>
[Brief description of what was implemented]</p>

<p><strong>The Results:</strong></p>
<ul>
<li>[Specific metric improvement]</li>
<li>[Time/cost savings]</li>
<li>[Additional benefit]</li>
</ul>

<p>Given our previous conversation about [prospect's challenge], I thought this might be relevant to [Company]'s situation.</p>

<p>Would you be interested in a brief conversation about how this approach might work for your team?</p>

<p>Best regards,<br>
[Your Name]</p>`,
    icon: 'BarChart'
  },
  {
    id: 'followup-soft-close',
    title: 'Follow-up #3 - Soft Close',
    category: 'Follow-up',
    description: 'Gentle follow-up with meeting request',
    content: `<p>Hi [Name],</p>

<p>I wanted to follow up on our previous conversations about [specific challenge/opportunity]. I know you mentioned that [specific pain point] has been a priority for [Company].</p>

<p>Based on what you've shared, I believe there might be a good fit for us to help with [specific solution area]. I've worked with several companies in [industry] facing similar challenges and have seen some excellent results.</p>

<p>Would it make sense to have a brief 20-minute conversation this week to explore this further? I can share some specific examples of how we've helped similar companies and we can discuss whether this approach might work for [Company].</p>

<p>I have availability on [specific days/times] - would any of these work for you?</p>

<p>Best regards,<br>
[Your Name]</p>`,
    icon: 'Calendar'
  },
  {
    id: 'meeting-confirmation',
    title: 'Meeting Confirmation',
    category: 'Meetings',
    description: 'Professional meeting confirmation with agenda',
    content: `<p>Hi [Name],</p>

<p>I'm looking forward to our conversation on [Date] at [Time]. I've sent you a calendar invite with the meeting details.</p>

<p><strong>Meeting Details:</strong><br>
📅 Date: [Date]<br>
🕐 Time: [Time] ([Time Zone])<br>
📍 Location: [Zoom/Phone/In-person details]<br>
⏰ Duration: [Duration]</p>

<p><strong>Agenda:</strong></p>
<ul>
<li>Quick introductions (5 min)</li>
<li>Discussion of [Company]'s current challenges with [specific area] (10 min)</li>
<li>Overview of potential solutions and next steps (10 min)</li>
<li>Q&A and next steps (5 min)</li>
</ul>

<p><strong>To make our time most productive, please consider:</strong></p>
<ul>
<li>[Specific question or preparation item]</li>
<li>[Another preparation item]</li>
</ul>

<p>If anything changes or you need to reschedule, please let me know.</p>

<p>Looking forward to our conversation!</p>

<p>Best regards,<br>
[Your Name]</p>`,
    icon: 'Calendar'
  },
  {
    id: 'meeting-followup',
    title: 'Meeting Follow-up',
    category: 'Meetings',
    description: 'Post-meeting recap with next steps',
    content: `<p>Hi [Name],</p>

<p>Thanks for taking the time to meet with me today! I enjoyed our conversation about [Company]'s goals and challenges with [specific area].</p>

<p><strong>Key Points from Our Discussion:</strong></p>
<ul>
<li>[Key point 1 from the meeting]</li>
<li>[Key point 2 from the meeting]</li>
<li>[Key point 3 from the meeting]</li>
</ul>

<p><strong>Next Steps:</strong></p>
<ul>
<li><strong>My action items:</strong>
  <ul>
    <li>[What you will do by when]</li>
    <li>[Another action item]</li>
  </ul>
</li>
<li><strong>Your action items:</strong>
  <ul>
    <li>[What they agreed to do]</li>
    <li>[Another action item if applicable]</li>
  </ul>
</li>
</ul>

<p>I'll follow up with [specific deliverable] by [specific date]. In the meantime, please don't hesitate to reach out if you have any questions.</p>

<p>Thanks again for your time, and I look forward to continuing our conversation!</p>

<p>Best regards,<br>
[Your Name]</p>`,
    icon: 'CheckSquare'
  },
  {
    id: 'proposal-email',
    title: 'Proposal Email',
    category: 'Closing',
    description: 'Professional proposal presentation email',
    content: `<p>Hi [Name],</p>

<p>Based on our conversation about [Company]'s needs with [specific challenge], I'm excited to share a proposal for how we can help you achieve [specific goal].</p>

<p><strong>What We Discussed:</strong></p>
<ul>
<li>[Key challenge 1]</li>
<li>[Key challenge 2]</li>
<li>[Desired outcome]</li>
</ul>

<p><strong>Our Recommended Solution:</strong></p>
<p>[Brief overview of the solution and how it addresses their specific needs]</p>

<p><strong>Expected Outcomes:</strong></p>
<ul>
<li>[Specific benefit 1 with metrics if possible]</li>
<li>[Specific benefit 2 with metrics if possible]</li>
<li>[Specific benefit 3 with metrics if possible]</li>
</ul>

<p><strong>Investment:</strong> [Pricing information]</p>

<p><strong>Timeline:</strong> [Implementation timeline]</p>

<p>I've attached a detailed proposal that outlines everything we discussed. The proposal includes [specific elements like timeline, deliverables, pricing, etc.].</p>

<p>I'd love to schedule a brief call to walk through the proposal and answer any questions you might have. Are you available for a 15-minute call this week?</p>

<p>Best regards,<br>
[Your Name]</p>`,
    icon: 'FileText'
  },
  {
    id: 'pricing-discussion',
    title: 'Pricing Discussion',
    category: 'Closing',
    description: 'Value-focused pricing conversation template',
    content: `<p>Hi [Name],</p>

<p>I wanted to follow up on our discussion about moving forward with [solution]. I understand you're evaluating the investment, so I thought it would be helpful to break down the value we'll deliver.</p>

<p><strong>Your Current Challenge:</strong><br>
[Specific pain point and its cost/impact]</p>

<p><strong>Our Solution Value:</strong></p>
<ul>
<li><strong>[Benefit 1]:</strong> [Quantified impact - time saved, cost reduced, revenue increased]</li>
<li><strong>[Benefit 2]:</strong> [Quantified impact]</li>
<li><strong>[Benefit 3]:</strong> [Quantified impact]</li>
</ul>

<p><strong>ROI Calculation:</strong><br>
Based on our discussions, implementing this solution could result in [specific ROI calculation] within [timeframe].</p>

<p><strong>Investment Options:</strong></p>
<ul>
<li><strong>Option 1:</strong> [Pricing and what's included]</li>
<li><strong>Option 2:</strong> [Alternative pricing/package]</li>
</ul>

<p>I'm confident this investment will pay for itself through [specific ways it will save money/generate revenue].</p>

<p>Would you like to schedule a brief call to discuss any questions about the investment or explore which option might work best for [Company]?</p>

<p>Best regards,<br>
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