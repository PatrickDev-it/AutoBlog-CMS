'use server';

interface DemoMessage {
	keywords: string[];
	responses: string[];
}

const demoResponses: DemoMessage[] = [
	{
		keywords: ['content', 'create', 'post', 'write', 'article'],
		responses: [
			`Creating compelling content is at the heart of a successful blog. Here are the key steps to get started:

1. **Choose Your Topic**: Select a subject that resonates with your audience. Consider trending topics, user questions, or gaps in existing coverage related to your niche.

2. **Research Thoroughly**: Gather credible sources, statistics, and expert insights. This adds authority to your content and provides value to readers.

3. **Structure Your Outline**: Organize your thoughts into a logical flow. A strong outline typically includes:
   - Engaging introduction (hook your reader)
   - Clear sections with subheadings
   - Relevant examples and case studies
   - Actionable takeaways
   - Compelling conclusion

4. **Write Your Draft**: Focus on clarity over perfection. Use conversational language, break up long paragraphs, and incorporate relevant keywords naturally.

5. **Optimize for SEO**: Include your primary keyword in the title, introduction, and headers. Use alt text for images and create descriptive slugs.

6. **Review and Edit**: Proofread carefully, check links, and ensure your formatting is consistent. Consider different perspectives and refine your message.

In our Autoblog CMS, you can structure posts within categories and subcategories, add featured images from your media library, and set publish states (Draft, Published, Scheduled). The system supports markdown formatting for rich text editing, making it easy to create polished content.`,
			`Effective content creation starts with understanding your audience and their pain points. Here's a structured approach:

**Pre-Writing Phase**:
- Define your target reader persona
- Identify the problem you're solving
- Research competitor content to find gaps

**Writing Process**:
- Start with a compelling headline that promises value
- Use the inverted pyramid: most important info first
- Include visuals to break up text and improve comprehension
- Add internal links to related content
- Use numbered lists and bullet points for scannability

**Post-Writing Optimization**:
- Fact-check all claims and citations
- Optimize images for web (compression, alt text)
- Add a clear call-to-action
- Create an engaging meta description
- Test readability across devices

With our Autoblog CMS, you can manage multiple content sections simultaneously. Group related posts, maintain version control through draft status, and schedule publication dates. The typewriter effect in our AI assistant helps you see detailed guidance as it's composed, making complex topics easier to digest.`,
		],
	},
	{
		keywords: ['design', 'layout', 'template', 'customize', 'styling'],
		responses: [
			`Designing a professional blog is crucial for both aesthetics and user experience. Here's how to approach your design strategy:

**Visual Hierarchy**:
- Use consistent typography (typically 2-3 font families max)
- Create clear size distinctions between headings and body text
- Apply adequate whitespace to improve readability
- Establish a color palette of 3-5 complementary colors

**Layout Best Practices**:
- Keep the main content column between 600-800px wide (optimal reading width)
- Place call-to-action buttons consistently (usually above the fold)
- Use responsive grids that adapt to mobile and tablet screens
- Ensure navigation is intuitive and accessible

**Visual Elements**:
- Feature images with proper aspect ratios (16:9 for headers)
- Include author avatars and bylines for credibility
- Use icons to break up lengthy text sections
- Incorporate brand elements consistently

**Performance Considerations**:
- Optimize all images for web (WebP format when possible)
- Use lazy loading for images below the fold
- Minimize CSS and JavaScript
- Implement a CDN for faster content delivery

Our Autoblog CMS integrates with Tailwind CSS for rapid styling and Next.js Image optimization. You can upload custom images for each section and maintain visual consistency across your blog without touching code.`,
			`Modern blog design combines aesthetics with functionality. Consider these design principles:

**User Experience Design**:
- Create user journeys that guide readers to key content
- Implement breadcrumb navigation for clarity
- Use consistent button styles and hover states
- Add search functionality for content discovery

**Mobile-First Approach**:
- Design for mobile first, then enhance for larger screens
- Ensure touch targets are at least 48x48px
- Test all interactive elements on touch devices
- Minimize redirects and loading times

**Accessibility Standards**:
- Maintain sufficient color contrast (WCAG AA minimum)
- Use semantic HTML for screen reader compatibility
- Provide alt text for all images
- Ensure keyboard navigation works throughout

**Branding Integration**:
- Display logo consistently in header and footer
- Use brand colors throughout the design
- Maintain a consistent tone in microcopy
- Include social media links prominently

The Autoblog CMS provides a modular component library with pre-built sections like featured posts, category navigation, and related articles. You can customize colors, spacing, and layouts through the admin interface.`,
		],
	},
	{
		keywords: ['seo', 'optimize', 'ranking', 'traffic', 'visibility'],
		responses: [
			`Search Engine Optimization is essential for blog visibility. Here's a comprehensive SEO strategy:

**On-Page SEO**:
- Include target keyword in title (front-loaded ideally)
- Write compelling meta descriptions (155-160 characters)
- Use H1, H2, H3 headers logically to structure content
- Maintain keyword density around 1-2% naturally
- Include internal links to related articles with descriptive anchor text
- Optimize URL slugs to include keywords

**Technical SEO**:
- Ensure fast page load times (target under 3 seconds)
- Implement SSL/HTTPS for security
- Create an XML sitemap and submit to search engines
- Use structured data markup (schema.org) for rich snippets
- Ensure mobile responsiveness and mobile-first indexing compatibility
- Fix broken links regularly

**Content Strategy**:
- Create comprehensive, in-depth content (1500+ words typically performs better)
- Target long-tail keywords with less competition
- Update existing content regularly to maintain freshness
- Create content clusters with pillar pages and supporting articles
- Build topical authority by covering related subjects deeply

**Link Building**:
- Earn backlinks from authoritative sites
- Use internal linking to distribute page authority
- Create linkable assets (guides, research, tools)
- Guest post on relevant industry blogs
- Monitor backlinks regularly

The Autoblog CMS automatically supports URL optimization, image alt text management, and internal linking. Our advisory feature helps you maintain editorial standards for SEO best practices.`,
			`Improving your blog's search engine ranking requires a multi-faceted approach:

**Keyword Research & Strategy**:
- Use tools like Google Search Console to identify search queries
- Analyze competitors ranking for your target keywords
- Target keywords with commercial intent and decent search volume
- Create topic clusters around core themes
- Include semantic variations and LSI keywords naturally

**Content Quality Signals**:
- Write original, authoritative content that demonstrates expertise
- Back claims with credible sources and citations
- Include multimedia content (images, videos, infographics)
- Update content regularly to maintain freshness signals
- Maintain consistent publishing schedule

**User Experience Signals**:
- Keep bounce rate low through engaging introductions
- Improve dwell time with well-structured, readable content
- Use internal links strategically to keep users engaged
- Optimize for Core Web Vitals (LCP, FID, CLS)
- Ensure smooth navigation and intuitive site structure

**Authority Building**:
- Develop E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Create author bios with credentials and social links
- Engage with comments and community discussions
- Establish yourself as a thought leader through original research
- Build a network of quality backlinks in your niche

Monitor your progress with Google Analytics and Google Search Console. The Autoblog CMS provides fields for optimizing every article's discoverability.`,
		],
	},
	{
		keywords: ['editorial', 'quality', 'standards', 'guidelines', 'brand'],
		responses: [
			`Maintaining editorial standards is crucial for building a strong, trustworthy blog brand:

**Editorial Guidelines**:
- Develop a comprehensive brand voice and tone guide
- Define your target audience and their preferences clearly
- Create writing standards (grammar, punctuation, style)
- Establish fact-checking and verification procedures
- Set clear approval workflows before publication

**Content Quality Checklist**:
- ✓ Fact-check all claims and statistics
- ✓ Verify sources are credible and current
- ✓ Check for plagiarism using detection tools
- ✓ Ensure consistency with brand voice and style
- ✓ Proofread for grammar, spelling, and punctuation
- ✓ Verify all links are working
- ✓ Optimize images for web and accessibility
- ✓ Review for SEO best practices
- ✓ Ensure meta descriptions and titles are compelling

**Consistency Standards**:
- Use consistent date formats and time zones
- Maintain uniform heading hierarchy
- Apply consistent formatting to lists and quotes
- Use template structures for recurring content types
- Keep image dimensions and aspect ratios consistent

**Governance**:
- Assign editorial roles (writer, editor, reviewer)
- Document approval processes and timelines
- Maintain content calendar with deadlines
- Archive editorial decisions and guidelines
- Regular audits of published content for quality

Our Autoblog CMS includes an editorial advisory section and content staging system, allowing you to maintain draft status, schedule publications, and manage multiple contributors. The sidebar organization helps maintain thematic consistency across your content library.`,
			`A strong editorial strategy ensures your blog maintains credibility and professional standards:

**Voice & Tone Guidelines**:
- Define primary and secondary tone attributes
- Create examples of correct and incorrect voice applications
- Establish guidelines for audience interaction
- Document how to handle corrections and updates
- Create templates for common content types

**Content Standards**:
- Set minimum word counts for comprehensive coverage
- Define image requirements (resolution, formats, alt text)
- Establish fact-checking procedures
- Create citation standards and bibliography practices
- Document content freshness policies

**Review Process**:
- Multiple-eye review before publication
- Subject matter expert validation for technical topics
- Legal review if covering potentially sensitive areas
- Performance tracking post-publication
- A/B testing of headlines and meta descriptions

**Brand Protection**:
- Consistency guidelines across all sections
- Approved terminology and language standards
- Visual identity standards for images and graphics
- Attribution policies for sourced content
- Crisis communication procedures

**Author Development**:
- Onboarding materials for new writers
- Style guide with examples
- Feedback mechanisms for continuous improvement
- Regular training on company standards
- Performance analytics and optimization feedback

The Autoblog CMS allows you to manage different content sections (Featured, Design, Culture, Insights, Resources) with their own editorial standards, tracked through our demo data structure.`,
		],
	},
	{
		keywords: ['analytics', 'metrics', 'performance', 'data', 'insights'],
		responses: [
			`Understanding your blog's performance is key to continuous improvement:

**Key Metrics to Track**:
- **Traffic Metrics**: Page views, unique visitors, traffic sources
- **Engagement Metrics**: Average session duration, bounce rate, pages per session
- **Conversion Metrics**: Click-through rates, goal completions, conversion funnels
- **Search Metrics**: Keywords, rankings, click position, impressions
- **Content Metrics**: Top performing articles, scroll depth, time on page

**Tools for Analysis**:
- Google Analytics 4 for comprehensive web analytics
- Google Search Console for search performance tracking
- Heatmapping tools (Hotjar, Microsoft Clarity) for user behavior
- A/B testing platforms for headline and layout optimization
- Social media analytics for content distribution

**Dashboard Creation**:
- Set up custom dashboards for different stakeholder needs
- Monitor KPIs that align with business objectives
- Create automated reports for regular review
- Set up alerts for significant changes (positive or negative)
- Compare metrics across time periods and segments

**Optimization Based on Data**:
- Identify top-performing content themes
- Analyze underperforming content for improvements
- Test variations in headlines, images, and CTAs
- Optimize publish times based on audience behavior
- Refine content promotion strategies

**Advanced Analysis**:
- Cohort analysis to understand user behavior patterns
- Attribution modeling to understand conversion paths
- Competitor benchmarking to contextualize performance
- Predictive analytics for forecasting trends
- Audience segmentation for personalized content

Implement consistent tracking across your Autoblog CMS to understand which sections, categories, and individual articles drive the most value for your business.`,
			`Data-driven content strategy maximizes your blog's impact:

**Baseline Metrics**:
- Establish baseline metrics for all key indicators
- Document current state before implementing changes
- Set realistic improvement targets
- Create a measurement timeline
- Define success criteria clearly

**Traffic Analysis**:
- Identify which traffic sources convert best
- Analyze user journey from first click to conversion
- Track referral sources and affiliate performance
- Monitor brand vs. non-brand search traffic
- Analyze geographic and demographic distribution

**Content Performance**:
- Calculate revenue per article (if monetized)
- Identify content with highest engagement
- Track content decay over time (freshness impact)
- Analyze topic clustering performance
- Measure impact of internal linking strategies

**User Behavior Insights**:
- Map user journeys through your content
- Identify decision points where users drop off
- Analyze scroll depth to understand engagement
- Track form submission patterns
- Monitor search behavior on-site

**Business Impact**:
- Connect content metrics to business outcomes
- Calculate customer acquisition cost by channel
- Track lifetime value of organic traffic
- Measure brand awareness metrics
- Quantify thought leadership impact

Use these insights to continuously evolve your Autoblog CMS strategy, focusing resources on content types and topics that drive measurable business value.`,
		],
	},
	{
		keywords: ['publish', 'schedule', 'launch', 'deploy', 'release'],
		responses: [
			`Publishing your content strategically maximizes its impact:

**Pre-Publication Checklist**:
- ✓ Final proofreading and fact-checking
- ✓ Optimize meta description and title tag
- ✓ Confirm featured image is selected and optimized
- ✓ Review all internal links are working
- ✓ Verify formatting on mobile devices
- ✓ Check social media preview appearances
- ✓ Assign appropriate categories and tags
- ✓ Schedule any social media promotion

**Publication Timing Strategy**:
- Publish when your audience is most active
- Avoid publishing during major news cycles (unless relevant)
- Space content to maintain consistent blog activity
- Consider email list engagement timing
- Analyze historical data for optimal publish times

**Social Media Promotion**:
- Create multiple social media variations
- Pull important quotes for graphics
- Create teaser content driving to full article
- Engage with comments and shares actively
- Schedule follow-up posts for evergreen content

**Email Strategy**:
- Include article in newsletter campaigns
- Segment list for targeted promotion
- Create standalone email series for pillar content
- Encourage subscriptions throughout article
- Track email-driven traffic separately

**Post-Publication**:
- Monitor comments and respond promptly
- Track initial traffic and performance metrics
- Share with relevant communities and networks
- Update internal links across the site
- Monitor for any technical issues
- Plan refresh schedule for ongoing updates

The Autoblog CMS allows you to set publish status (Draft/Published), schedule content, and manage multiple sections with coordinated releases.`,
			`Effective publishing workflow ensures consistent, high-quality content delivery:

**Content Calendar Management**:
- Plan content 2-3 months in advance
- Balance evergreen and timely content
- Distribute content types across publishing schedule
- Account for seasonal trends and events
- Build flexibility for trending topics

**Workflow Automation**:
- Set up automated reminders for upcoming deadlines
- Create templates for different content types
- Automate social media sharing
- Set up distribution to multiple channels
- Configure email notifications for approvals

**Version Control**:
- Track revisions and editorial changes
- Document approval workflows
- Maintain changelog of content updates
- Archive previous versions for reference
- Track by-line attributions

**Multi-Channel Distribution**:
- Repurpose content for different platforms
- Adapt format for LinkedIn, Twitter, Medium, etc.
- Create downloadable resources (PDFs, checklists)
- Distribute via email, RSS, social media
- Track performance across each channel

**Launch Coordination**:
- Coordinate with marketing and PR teams
- Plan influencer outreach and promotion
- Schedule paid promotion if applicable
- Time publications to maximize visibility
- Prepare crisis communication plans if needed

Our Autoblog CMS supports scheduling, draft management, and cross-section organization for coordinated content launches.`,
		],
	},
	{
		keywords: ['help', 'assist', 'advice', 'recommend', 'suggestion'],
		responses: [
			`I'm here to help you maximize your Autoblog CMS! Here's what I can assist with:

**Content Creation Support**:
- Help you brainstorm article ideas and topics
- Provide writing templates and structures
- Suggest content optimization strategies
- Recommend relevant keywords and topics
- Guide you through editorial best practices

**CMS Navigation & Features**:
- Explain how to use different CMS sections
- Help organize content into categories and subcategories
- Guide you through publishing workflows
- Assist with media library management
- Support scheduling and planning features

**Strategy & Planning**:
- Help develop your content calendar
- Suggest audience-focused topics
- Recommend content distribution strategies
- Guide SEO optimization efforts
- Support analytics interpretation

**Quality & Standards**:
- Review content against editorial guidelines
- Suggest improvements for clarity and engagement
- Help with tone and voice consistency
- Provide feedback on structure and flow
- Recommend fact-checking sources

How can I best support your blogging goals today? Feel free to ask about writing techniques, CMS features, SEO strategies, content planning, or anything else related to your Autoblog CMS platform.`,
			`I'm your Autoblog CMS assistant, ready to help with:

**Writing & Content Strategy**:
- Develop compelling article outlines
- Improve existing content for better performance
- Suggest engaging headlines and meta descriptions
- Create content calendars and posting schedules
- Research trending topics in your niche

**Technical Guidance**:
- Navigate CMS features and sections
- Organize content effectively
- Manage media and images
- Optimize for search engines
- Troubleshoot common issues

**Editorial Excellence**:
- Maintain quality and consistency
- Develop brand voice guidelines
- Create editorial standards
- Improve readability and engagement
- Ensure factual accuracy

**Growth & Analytics**:
- Interpret performance metrics
- Identify top-performing content
- Spot opportunities for improvement
- Develop audience engagement strategies
- Plan content iterations based on data

Whether you're a new blogger or experienced content creator, I'm here to provide practical, actionable guidance. What would you like to focus on?`,
		],
	},
	{
		keywords: ['ai', 'assistant', 'gemini', 'intelligence', 'feature'],
		responses: [
			`The AI Assistant in your Autoblog CMS is designed to enhance your content creation workflow intelligently:

**Intelligent Features**:
- **Smart Ideation**: Generate content ideas based on audience interests and trends
- **Content Analysis**: Analyze your existing content for performance patterns
- **SEO Guidance**: Provide keyword suggestions and optimization recommendations
- **Writing Enhancement**: Suggest improvements for clarity, engagement, and tone
- **Structure Support**: Help organize thoughts into compelling narratives

**How This Integration Works**:
The AI assistant learns from your content patterns and audience behavior. Each question you ask helps refine future recommendations. The typewriter effect you see simulates real-time thinking, making complex guidance easier to absorb incrementally rather than all at once.

**Supported Use Cases**:
- Brainstorming article topics and angles
- Outlining comprehensive guides and tutorials
- Optimizing headlines for click-through
- Improving content readability and flow
- Developing content strategy and editorial calendars
- Analyzing performance metrics and insights
- Creating consistent brand voice and tone

**Learning & Improvement**:
The more you interact with the AI assistant, the better it understands your:
- Writing style and preferences
- Audience and niche focus
- Content performance patterns
- Brand voice and values
- Content creation goals

This creates a personalized assistant that improves recommendations over time.`,
			`Your Autoblog CMS AI Assistant represents the future of blogging technology:

**Why AI Integration Matters**:
- **Speed**: Generate quality content faster with intelligent suggestions
- **Quality**: Improve content quality through evidence-based recommendations
- **Consistency**: Maintain brand voice across all content automatically
- **Scale**: Handle larger content volumes without proportional effort increase
- **Learning**: System improves as it learns your preferences and patterns

**Deep Integration Benefits**:
- Every section of your CMS has AI insights available
- Recommendations adapt based on your publish history
- Performance analytics inform future suggestions
- Content calendar integration for strategic planning
- Real-time optimization tips as you write

**Building Better Content Together**:
The AI assistant doesn't replace human creativity—it amplifies it. Think of it as:
- A brainstorming partner for ideas and angles
- An editor suggesting improvements
- A researcher providing data and insights
- A strategist analyzing performance patterns
- A guide on best practices and techniques

**Privacy & Control**:
All interactions are session-based and don't permanently modify your content without approval. You maintain complete control over what gets published. The AI serves as advisor, not decision-maker.

This integration transforms your blogging from manual work into a collaborative, intelligent process designed to maximize impact and efficiency.`,
		],
	},
];

export default async (_model: string, _history: any[], message: string) => {
	const normalized = message?.trim?.() ?? '';

	if (!normalized.length) {
		return 'Demo mode: no input received.';
	}

	// Find matching response category
	for (const category of demoResponses) {
		for (const keyword of category.keywords) {
			if (normalized.toLowerCase().includes(keyword)) {
				// Pick a random response from the category
				const responses = category.responses;
				const randomIndex = Math.floor(Math.random() * responses.length);
				return responses[randomIndex];
			}
		}
	}

	// Default response if no keywords match
	return `I appreciate your question: "${normalized}"

In a production environment, I would provide a detailed, intelligent response powered by Gemini AI. The Autoblog CMS integrates with Google's generative AI to provide:

- **Contextual Writing Assistance**: Tailored suggestions based on your type of blog
- **Content Strategy Guidance**: Data-driven recommendations for better performance
- **Editorial Review**: Quality checks for tone, clarity, and completeness
- **SEO Optimization**: Keyword suggestions and ranking optimization tips
- **Performance Analysis**: Insights on what's working and what needs improvement

Feel free to ask about content creation, blog strategy, CMS features, SEO optimization, editorial standards, analytics insights, publishing workflows, or anything else related to managing and growing your blog.

In demo mode, I'm providing representative responses to showcase these capabilities. With real Gemini integration, I would understand context, follow conversation history, and provide increasingly personalized guidance based on your unique situation.`;
};
