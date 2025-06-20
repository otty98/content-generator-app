import React, { useState, useEffect } from 'react';
import { Copy, Download, Settings, Zap, Clock, Activity, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import './App.css';

const MarketingCopyGenerator = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedTemplate, setSelectedTemplate] = useState('product-description');
  const [inputs, setInputs] = useState({
    productName: '',
    category: '',
    features: '',
    targetAudience: '',
    tone: 'professional',
    length: 'medium',
    focusArea: 'benefits'
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStats, setGenerationStats] = useState({
    tokensUsed: 0,
    timeElapsed: 0,
    requestCount: 0
  });
  const [savedOutputs, setSavedOutputs] = useState([]);
  const [error, setError] = useState('');

  // Check for API key on component mount
  useEffect(() => {
    const hasApiKey = import.meta?.env?.VITE_OPENROUTER_API_KEY;
    if (!hasApiKey) {
      console.warn('OpenRouter API key not found. Using mock data mode.');
    }
  }, []);

  // Prompt Templates with Advanced Engineering
  const promptTemplates = {
    'product-description': {
      name: 'Product Description',
      category: 'E-commerce',
      methodology: 'Feature-Benefit-Proof Framework',
      template: `You are an expert copywriter specializing in converting product descriptions. Use the FBP (Feature-Benefit-Proof) framework.

CONTEXT: Write a compelling product description for {productName} in the {category} category.

REQUIREMENTS:
- Target audience: {targetAudience}
- Tone: {tone}
- Length: {length} (short=50-75 words, medium=100-150 words, long=200-250 words)
- Focus: {focusArea}

STRUCTURE:
1. Hook: Attention-grabbing opening
2. Features: Key product attributes
3. Benefits: How features solve customer problems
4. Social proof: Trust indicators
5. Call-to-action: Clear next step

FEATURES TO HIGHLIGHT: {features}

CONSTRAINTS:
- Use active voice
- Include emotional triggers
- Avoid jargon unless {targetAudience} expects it
- Include sensory language where appropriate

Generate the product description now:`
    },
    'email-campaign': {
      name: 'Email Campaign',
      category: 'Email Marketing',
      methodology: 'AIDA + Urgency Framework',
      template: `You are a direct response email marketing specialist. Create a high-converting email using the AIDA framework with urgency psychology.

PRODUCT: {productName}
AUDIENCE: {targetAudience}
TONE: {tone}
GOAL: Drive {focusArea}

EMAIL STRUCTURE:
Subject Line: Create 3 options (A/B/C)
- A: Curiosity-driven
- B: Benefit-focused  
- C: Urgency-based

Body ({length}):
ATTENTION: Hook that stops the scroll
INTEREST: Build intrigue with {features}
DESIRE: Connect emotionally to customer needs
ACTION: Clear, compelling CTA

PSYCHOLOGICAL TRIGGERS:
- Scarcity/urgency
- Social proof
- Loss aversion
- Reciprocity

CATEGORY CONTEXT: {category}

Generate the complete email campaign:`
    },
    'social-media': {
      name: 'Social Media Post',
      category: 'Social Marketing',
      methodology: 'Hook-Value-CTA Pattern',
      template: `You are a social media strategist creating viral-worthy content. Use the Hook-Value-CTA pattern optimized for engagement.

PRODUCT: {productName} ({category})
PLATFORM: Multi-platform (optimize for Instagram/LinkedIn)
AUDIENCE: {targetAudience}
TONE: {tone}
FOCUS: {focusArea}

POST STRUCTURE:
HOOK (First 5 words): Stop-scroll opener
VALUE: Educational/entertaining content about {features}
CTA: Engagement-driving call-to-action

FORMAT OPTIONS based on {length}:
- Short: Single compelling post
- Medium: Carousel-style breakdown
- Long: Story-driven narrative

ENGAGEMENT TACTICS:
- Question prompts
- Controversial takes (tasteful)
- Behind-the-scenes insights
- User-generated content angles

Generate the social media content:`
    },
    'landing-page': {
      name: 'Landing Page Copy',
      category: 'Web Copy',
      methodology: 'PAS + Social Proof Framework',
      template: `You are a conversion copywriter specializing in high-converting landing pages. Use the PAS (Problem-Agitate-Solution) framework enhanced with social proof.

PRODUCT: {productName}
MARKET: {category}
VISITOR: {targetAudience}
TONE: {tone}
CONVERSION GOAL: {focusArea}

LANDING PAGE SECTIONS:

HERO ({length} headline + subhead):
- Clear value proposition
- Benefit-focused headline
- Supporting subheadline

PROBLEM/AGITATION:
Identify pain points for {targetAudience}

SOLUTION:
How {productName} solves it with {features}

SOCIAL PROOF:
- Testimonials
- Statistics
- Trust indicators

CTA OPTIMIZATION:
- Action-oriented language
- Urgency/scarcity
- Risk reversal

Generate the complete landing page copy:`
    },
    'press-release': {
      name: 'Press Release',
      category: 'PR/Media',
      methodology: 'Inverted Pyramid + Newsworthiness',
      template: `You are a PR professional writing newsworthy press releases. Use the inverted pyramid structure with strong news angles.

ANNOUNCEMENT: {productName} launch/update
INDUSTRY: {category}
TARGET MEDIA: Trade publications, industry blogs
TONE: {tone} but authoritative
ANGLE: {focusArea}

PRESS RELEASE STRUCTURE:

HEADLINE: Newsworthy, keyword-optimized
DATELINE: [City, Date]
LEAD PARAGRAPH: 5 W's (Who, What, When, Where, Why)
BODY: Supporting details about {features}
QUOTES: Executive/expert commentary
BOILERPLATE: Company background
CONTACT: Media relations info

NEWS ANGLES:
- Innovation/disruption
- Market impact
- Industry trends
- Customer success

AUDIENCE: {targetAudience} (as end users)
LENGTH: {length} (short=200-300 words, medium=400-500 words, long=600-800 words)

Generate the press release:`
    }
  };

  const buildPrompt = (templateKey, inputs) => {
    const template = promptTemplates[templateKey].template;
    return Object.entries(inputs).reduce((str, [key, value]) => 
      str.replace(new RegExp(`{${key}}`, 'g'), value || '[Not specified]'),
      template
    );
  };

  // Rate limiting state
  let lastRequestTime = 0;

  const generateContent = async () => {
    const now = Date.now();
    
    // Rate limiting (10 seconds between requests for better UX)
    if (now - lastRequestTime < 10000) {
      const secondsLeft = Math.ceil((10000 - (now - lastRequestTime)) / 1000);
      setError(`Please wait ${secondsLeft} seconds before generating again`);
      return;
    }

    lastRequestTime = now;
    setIsGenerating(true);
    setError('');
    const startTime = Date.now();

    try {
      // Validate inputs
      if (!inputs.productName.trim()) {
        throw new Error('Product name is required');
      }

      // Check if API key exists
      const apiKey = import.meta?.env?.VITE_OPENROUTER_API_KEY;
      
      if (!apiKey) {
        // Fallback to mock data if no API key
        console.warn('No API key found, generating mock content...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockContent = generateSampleContent(selectedTemplate, inputs);
        setGeneratedContent(mockContent);
        setGenerationStats(prev => ({
          tokensUsed: prev.tokensUsed + Math.floor(mockContent.length / 4),
          timeElapsed: Date.now() - startTime,
          requestCount: prev.requestCount + 1
        }));
        return;
      }

      // Build the prompt
      const prompt = buildPrompt(selectedTemplate, inputs);

      // API call with better error handling
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Marketing Copy Generator'
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are a skilled marketing copywriter specializing in high-converting content. Always provide actionable, specific, and engaging copy that drives results." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          // If can't parse error, use status
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content generated from API');
      }
      
      // Update stats and content
      setGeneratedContent(content);
      setGenerationStats(prev => ({
        tokensUsed: prev.tokensUsed + (result.usage?.total_tokens || Math.floor(content.length / 4)),
        timeElapsed: Date.now() - startTime,
        requestCount: prev.requestCount + 1
      }));

    } catch (err) {
      console.error('Generation error:', err);
      setError(`Generation failed: ${err.message}`);
      
      // Fallback to mock data on any error
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const fallbackContent = generateSampleContent(selectedTemplate, inputs);
        setGeneratedContent(fallbackContent);
        setGenerationStats(prev => ({
          tokensUsed: prev.tokensUsed + Math.floor(fallbackContent.length / 4),
          timeElapsed: Date.now() - startTime,
          requestCount: prev.requestCount + 1
        }));
        setError('API unavailable - showing sample content. Please check your API configuration.');
      } catch (fallbackError) {
        setError('Unable to generate content. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleContent = (templateType, inputs) => {
    const { productName, category, targetAudience, tone, features } = inputs;
    
    // Context-aware content generation based on category
    const getContextualContent = (category, productName, targetAudience, features) => {
      const lowerCategory = category.toLowerCase();
      
      if (lowerCategory.includes('shoe') || lowerCategory.includes('sneaker') || lowerCategory.includes('footwear')) {
        return {
          benefits: [
            `Revolutionary comfort technology keeps you going all day`,
            `Premium materials ensure durability for any adventure`,
            `Stylish design that turns heads wherever you go`,
            `Performance-engineered for your active lifestyle`
          ],
          testimonial: `"These ${productName} are game-changers! Perfect fit, incredible comfort, and I get compliments everywhere I go. Best investment for my feet!" - Alex Rodriguez, Fitness Enthusiast`,
          cta: `Step into comfort and style with ${productName}`,
          offer: `Free shipping + 60-day comfort guarantee`
        };
      } else if (lowerCategory.includes('tech') || lowerCategory.includes('software') || lowerCategory.includes('app')) {
        return {
          benefits: [
            `Streamlined workflow increases productivity by 40%`,
            `Intuitive design reduces learning curve to just 2 days`,
            `Enterprise-grade security protects your valuable data`,
            `24/7 support ensures you're never stuck`
          ],
          testimonial: `"Since implementing ${productName}, our team's efficiency has skyrocketed. The ${features} feature alone saves us 10 hours per week." - Sarah Chen, Operations Director`,
          cta: `Transform your ${category.toLowerCase()} workflow`,
          offer: `20% off your first year + free implementation support`
        };
      } else if (lowerCategory.includes('food') || lowerCategory.includes('drink') || lowerCategory.includes('beverage')) {
        return {
          benefits: [
            `Premium ingredients sourced from the finest suppliers`,
            `Artisanal craftsmanship in every batch`,
            `Satisfaction guaranteed or your money back`,
            `Loved by food enthusiasts worldwide`
          ],
          testimonial: `"${productName} has become my go-to choice. The quality is unmatched and the taste is incredible!" - Maria Santos, Food Blogger`,
          cta: `Taste the difference with ${productName}`,
          offer: `Free shipping on orders over $50`
        };
      } else if (lowerCategory.includes('fitness') || lowerCategory.includes('health') || lowerCategory.includes('wellness')) {
        return {
          benefits: [
            `Scientifically proven results in just 30 days`,
            `Easy-to-follow program fits any schedule`,
            `Expert guidance every step of the way`,
            `Join thousands who've transformed their lives`
          ],
          testimonial: `"${productName} changed my life! I feel stronger, more confident, and healthier than ever." - David Kim, Personal Trainer`,
          cta: `Start your transformation with ${productName}`,
          offer: `30-day money-back guarantee + bonus materials`
        };
      } else {
        // Generic fallback
        return {
          benefits: [
            `Superior quality that exceeds expectations`,
            `Innovative design that stands out from the crowd`,
            `Trusted by thousands of satisfied customers`,
            `Exceptional value for your investment`
          ],
          testimonial: `"${productName} exceeded all my expectations. Quality, performance, and value - everything I was looking for!" - Taylor Johnson, Verified Customer`,
          cta: `Experience the ${productName} difference`,
          offer: `Special launch pricing + satisfaction guarantee`
        };
      }
    };
    
    const contextualContent = getContextualContent(category, productName, targetAudience, features);
    
    const samples = {
      'product-description': `**${productName}**: ${category ? `Elevate Your ${category} Experience` : 'Premium Quality You Can Trust'}

${contextualContent.cta}. ${features ? `Featuring ${features}, ` : ''}${productName} delivers the perfect combination of quality, performance, and style that ${targetAudience || 'discerning customers'} demand.

**Why Choose ${productName}:**
${contextualContent.benefits.map(benefit => `• ${benefit}`).join('\n')}

**Real Customer Experience:**
${contextualContent.testimonial}

**Ready to Experience ${productName}?**
Join thousands of satisfied customers who've made the smart choice. 

*${contextualContent.offer}*

**Order now and discover why ${productName} is the #1 choice for ${targetAudience || 'customers like you'}.**`,

      'email-campaign': `**Subject Lines:**
A) "${category ? `The ${category} secret` : 'The secret'} that's changing everything..."
B) "${productName}: ${contextualContent.benefits[0].toLowerCase()}"
C) "⏰ Only 48 hours left: ${productName} exclusive access"

**Email Body:**

Hi [Name],

${category.includes('clothing') || category.includes('footwear') ? 
  `What if I told you that you could look amazing AND feel comfortable all day?\n\nYou'd probably think style and comfort don't go together...\n\nBut here's the proof: Over 10,000 people have discovered ${productName}, and they're never going back.` :
  `What if I told you that ${targetAudience || 'people like you'} are achieving incredible results in just weeks?\n\nYou'd probably think I'm exaggerating...\n\nBut here's the proof: Over 10,000 customers have already discovered ${productName}, and the results speak for themselves.`
}

**The Problem:** ${category.includes('clothing') ? 'Products that look good but sacrifice comfort' : `Traditional ${category} solutions that waste time and money`}
**The Solution:** ${productName}${features ? ` with ${features}` : ''}

**Real Results:**
${contextualContent.benefits.slice(0, 3).map(benefit => `• ${benefit}`).join('\n')}

${contextualContent.testimonial}

**Here's the deal:** We're offering exclusive access to the next 100 customers only.

[GET EXCLUSIVE ACCESS - SPECIAL PRICING]

But hurry - this offer expires in 48 hours.

Best regards,
The ${productName} Team

P.S. Still unsure? We offer a ${contextualContent.offer.includes('60-day') ? '60-day' : '30-day'} guarantee. Zero risk, maximum reward.`,

      'social-media': `🚀 **STOP scrolling.**

We just discovered the secret to ${category.includes('clothing') || category.includes('footwear') ? 'all-day comfort AND style' : `${category} success`}...

${targetAudience || 'People'} are getting ${category.includes('clothing') ? 'the perfect fit' : 'amazing results'} with ${productName} ⚡

**Here's what makes it different:**
${contextualContent.benefits.slice(0, 3).map(benefit => `✅ ${benefit}`).join('\n')}
✅ ${contextualContent.offer.split('+')[1]?.trim() || '30-day guarantee'}

**Real talk:** I was skeptical too...

But then I ${category.includes('clothing') ? 'tried it myself' : 'saw the results'}:
${category.includes('clothing') ? 
  `→ Perfect fit, incredible comfort\n→ Compliments everywhere I go\n→ Best investment I've made` :
  `→ Results in just 2 weeks\n→ Easy to use and implement\n→ Worth every penny`
}

**Want to ${category.includes('clothing') ? 'experience the difference' : 'see the results'}?**
👆 DM me "${category.includes('clothing') ? 'STYLE' : 'RESULTS'}" for exclusive access

**Question for you:** What's your biggest ${category} challenge? 👇

#${category.replace(/\s+/g, '')} #${productName.replace(/\s+/g, '')} #Quality #Results

---

**Engagement Hooks:**
💬 "What's your biggest ${category} frustration?"
🔄 "Share if you want ${contextualContent.benefits[0].toLowerCase()}!"
❤️ "Like if you're ready for a change!"`,

      'landing-page': `# **Finally, ${category} That Actually ${category.includes('clothing') ? 'Fits Perfect AND Feels Amazing' : 'Works'}**
## ${contextualContent.benefits[0]} - guaranteed or your money back

---

**${category.includes('clothing') ? 'Are you tired of choosing between style and comfort?' : `Are you tired of ${category} solutions that promise everything but deliver nothing?`}**

You're not alone. ${category.includes('clothing') ? '87% of people struggle with ill-fitting products that look good but feel terrible.' : `87% of ${targetAudience || 'people'} struggle with ineffective solutions that waste time and money.`}

**The frustration is real:**
${category.includes('clothing') ? 
  `→ Clothes that look good but feel uncomfortable\n→ Choosing between style and comfort\n→ Expensive items that don't fit right\n→ Disappointment with every purchase` :
  `→ Time wasted on ineffective methods\n→ Products that don't deliver results\n→ Promises that fall flat\n→ Solutions that are too complicated`
}

**What if there was a better way?**

## **Introducing ${productName}**

${contextualContent.cta}. The only ${category} solution that delivers both style AND comfort - guaranteed.

**Here's how we're different:**
${contextualContent.benefits.map(benefit => `✅ **${benefit}**`).join('\n')}

## **Real Results from Real Customers**

*${contextualContent.testimonial}*

**"I've tried countless ${category} options, but ${productName} is in a league of its own. Finally, something that actually works!"** - Jordan Smith, Verified Customer

## **Ready to ${contextualContent.cta}?**

**Special Launch Offer:**
- ✅ ${contextualContent.offer}
- ✅ Free shipping on all orders
- ✅ Priority customer support
- ✅ 100% satisfaction promise

[**ORDER NOW - SPECIAL PRICING**] [**LEARN MORE**]

*No risk. Results guaranteed.*

---

**Still have questions? Our customer success team is standing by to help.**`,

      'press-release': `**FOR IMMEDIATE RELEASE**

**${productName} Launches Revolutionary ${category} Solution, Delivering ${contextualContent.benefits[0]}**

*Innovative technology addresses key consumer pain points with ${features ? `proprietary ${features} technology` : 'advanced engineering'}*

**[CITY, DATE]** - ${productName}, a leading innovator in ${category} solutions, today announced the launch of its groundbreaking platform designed specifically for ${targetAudience || 'modern consumers'}. The solution addresses critical industry challenges by leveraging ${features ? `advanced ${features}` : 'innovative technology'} to deliver unprecedented results.

The ${category} industry has long struggled with solutions that fail to meet modern consumer demands for both quality and performance. ${productName} addresses this challenge through its revolutionary approach that combines effectiveness with user satisfaction.

**"We're not just launching another ${category} product - we're fundamentally changing how people approach ${category},"** said [CEO Name], CEO of ${productName}. **"Our customers are achieving results that seemed impossible just months ago. This isn't incremental improvement; it's transformation."**

Early adopters have reported remarkable improvements, with many achieving ${contextualContent.benefits[0].toLowerCase()} within the first week of use. The product's unique technology sets it apart from traditional solutions that often require extensive setup and training.

**Key product features include:**
${contextualContent.benefits.map(benefit => `- ${benefit}`).join('\n')}
- ${contextualContent.offer.split('+')[1]?.trim() || '30-day satisfaction guarantee'}
- Premium customer support

**Industry expert Dr. Jane Smith, Research Director at ${category} Analytics, commented:** *"${productName} represents a significant advancement in ${category} technology. The combination of ${features || 'innovative design'} with practical usability addresses the core challenges we've identified in our research."*

The platform is immediately available to consumers globally, with pricing starting at competitive rates. The company is offering ${contextualContent.offer}.

**About ${productName}**
Founded in 2024, ${productName} is dedicated to revolutionizing ${category} through innovative technology solutions. The company serves customers worldwide and is committed to delivering exceptional results and customer satisfaction.

**Media Contact:**
[Name]
[Title]
[Phone]
[Email]

**Customer Contact:**
[Phone]
[Email]
[Website]

###`
    };
    
    return samples[templateType] || 'Content generation in progress...';
  };

  const saveOutput = () => {
    if (generatedContent) {
      const newOutput = {
        id: Date.now(),
        template: selectedTemplate,
        content: generatedContent,
        inputs: { ...inputs },
        timestamp: new Date().toISOString(),
        stats: { ...generationStats }
      };
      setSavedOutputs(prev => [newOutput, ...prev]);
    }
  };

  const exportContent = (format = 'txt') => {
    const content = `${promptTemplates[selectedTemplate].name} - Generated ${new Date().toLocaleDateString()}\n\n${generatedContent}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-copy-${selectedTemplate}-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            AI Marketing Copy Generator
          </h1>
          <p className="text-blue-100 mt-2">Advanced prompt engineering for high-converting marketing content</p>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['generator', 'templates', 'analytics', 'saved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(promptTemplates).map(([key, template]) => (
                      <option key={key} value={key}>
                        {template.name} - {template.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product/Service Name *
                    </label>
                    <input
                      type="text"
                      value={inputs.productName}
                      onChange={(e) => setInputs(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., TaskFlow Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={inputs.category}
                      onChange={(e) => setInputs(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Project Management"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features
                  </label>
                  <textarea
                    value={inputs.features}
                    onChange={(e) => setInputs(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="e.g., AI-powered task prioritization, real-time collaboration, advanced analytics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={inputs.targetAudience}
                    onChange={(e) => setInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Small business owners, Marketing managers"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={inputs.tone}
                      onChange={(e) => setInputs(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="conversational">Conversational</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <select
                      value={inputs.length}
                      onChange={(e) => setInputs(prev => ({ ...prev, length: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Area
                    </label>
                    <select
                      value={inputs.focusArea}
                      onChange={(e) => setInputs(prev => ({ ...prev, focusArea: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="benefits">Benefits</option>
                      <option value="features">Features</option>
                      <option value="social-proof">Social Proof</option>
                      <option value="urgency">Urgency</option>
                      <option value="trust">Trust Building</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating || !inputs.productName.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Content
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
              </div>

              {/* Output Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Content</h3>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={saveOutput}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Save output"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportContent()}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Export content"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
                  {generatedContent ? (
                    <div className="whitespace-pre-wrap text-sm">{generatedContent}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Configure your inputs and click "Generate Content" to get started</p>
                      </div>
                    </div>
                  )}
                </div>

                {generationStats.requestCount > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Generation Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{generationStats.tokensUsed}</div>
                        <div className="text-blue-700">Total Tokens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{(generationStats.timeElapsed / 1000).toFixed(1)}s</div>
                        <div className="text-blue-700">Last Generation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{generationStats.requestCount}</div>
                        <div className="text-blue-700">Total Requests</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Prompt Templates & Methodology</h2>
              <div className="grid gap-6">
                {Object.entries(promptTemplates).map(([key, template]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {template.category}
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Methodology: </span>
                      <span className="text-gray-600">{template.methodology}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Prompt Template:</h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {template.template.substring(0, 300)}...
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Performance Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Generations</p>
                      <p className="text-3xl font-bold">{generationStats.requestCount}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Tokens Used</p>
                      <p className="text-3xl font-bold">{generationStats.tokensUsed.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Avg Generation Time</p>
                      <p className="text-3xl font-bold">
                        {generationStats.requestCount > 0 
                          ? (generationStats.timeElapsed / 1000).toFixed(1) + 's'
                          : '0s'
                        }
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Template Usage Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(promptTemplates).map(([key, template]) => {
                    const usage = savedOutputs.filter(output => output.template === key).length;
                    const percentage = savedOutputs.length > 0 ? (usage / savedOutputs.length) * 100 : 0;
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{template.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{usage} uses</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">API Usage Guidelines</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Token Limit:</strong> 4,000 tokens per request (approx. 16,000 characters)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Rate Limit:</strong> 50 requests per minute for optimal performance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Best Practices:</strong> Use specific inputs for better results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Cost Optimization:</strong> Shorter prompts reduce token usage</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Saved Outputs</h2>
                <span className="text-gray-500">{savedOutputs.length} saved items</span>
              </div>
              
              {savedOutputs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Settings className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">No saved outputs yet</p>
                    <p className="text-sm">Generate some content and save it to see it here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedOutputs.map((output) => (
                    <div key={output.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{promptTemplates[output.template].name}</h3>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                            {output.inputs.productName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {new Date(output.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="text-sm text-gray-700 line-clamp-3">
                          {output.content.substring(0, 200)}...
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Tokens: {Math.floor(output.content.length / 4)}</span>
                          <span>Length: {output.inputs.length}</span>
                          <span>Tone: {output.inputs.tone}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(output.content)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const content = `${promptTemplates[output.template].name} - ${new Date(output.timestamp).toLocaleDateString()}\n\n${output.content}`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `saved-output-${output.id}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingCopyGenerator;
