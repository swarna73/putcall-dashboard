import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PutCall | Real-Time Market Intelligence Platform',
  description: 'Learn about PutCall.nl - a comprehensive financial market intelligence platform combining Reddit sentiment, insider trading monitoring, fundamentals screening, and breaking news.',
  openGraph: {
    title: 'About PutCall | Market Intelligence Platform',
    description: 'Real-time stock analysis powered by multiple data sources',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About PutCall
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time market intelligence that cuts through the noise
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            PutCall was built to provide investors with <strong>authentic, real-time market intelligence</strong> 
            from multiple authoritative sources. We believe that better investment decisions come from 
            understanding the complete picture: what retail investors are discussing, what insiders are 
            doing, and what the fundamentals actually show.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Unlike platforms that rely on stale data or AI-generated placeholders, PutCall delivers 
            <strong> live data directly from the source</strong> - ensuring accuracy and reliability 
            when it matters most.
          </p>
        </div>

        {/* What We Track */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What We Track
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Reddit Sentiment
              </h3>
              <p className="text-gray-700">
                Real-time tracking of discussions across investing subreddits using Reddit's JSON API. 
                See what retail investors are talking about before it becomes mainstream news.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Insider Trading
              </h3>
              <p className="text-gray-700">
                Monitor significant insider buying and selling activity from SEC filings. 
                When executives put their own money on the line, it's worth paying attention.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fundamentals Screening
              </h3>
              <p className="text-gray-700">
                Live stock prices, market caps, P/E ratios, and key financial metrics from 
                Yahoo Finance and Finnhub. No outdated data, no placeholders.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Breaking News
              </h3>
              <p className="text-gray-700">
                Market-moving news aggregated in real-time. Plus CNN's Fear & Greed Index 
                to gauge overall market sentiment.
              </p>
            </div>
          </div>
        </div>

        {/* Why PutCall */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Why PutCall?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Authentic Data Only</h3>
                <p className="text-blue-100">
                  No hardcoded fallbacks or placeholder data. If you see a price, it's live from the API.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Multiple Data Sources</h3>
                <p className="text-blue-100">
                  Cross-reference across Reddit, SEC filings, financial APIs, and news feeds 
                  for a complete picture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Built for European Investors</h3>
                <p className="text-blue-100">
                  Tri-weekly newsletter delivery (Mon/Wed/Fri) timed for European market hours, 
                  not just US-centric coverage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Performance Optimized</h3>
                <p className="text-blue-100">
                  Sub-2-second load times through parallel API calls and efficient data fetching. 
                  No waiting 15-30 seconds for AI-powered searches.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              PutCall is built on a modern tech stack designed for speed and reliability:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Frontend</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Next.js with React</li>
                  <li>• Deployed on Vercel</li>
                  <li>• Real-time updates</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Backend & Data</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Supabase database</li>
                  <li>• Multiple API integrations</li>
                  <li>• GitHub Actions scheduling</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Data Sources</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Yahoo Finance</li>
                  <li>• Finnhub & API Ninjas</li>
                  <li>• Reddit JSON API</li>
                  <li>• CNN Fear & Greed Index</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Newsletter</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Custom domain email (Resend)</li>
                  <li>• Tri-weekly delivery</li>
                  <li>• Automated via GitHub Actions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Future Plans */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 What's Next
          </h2>
          <p className="text-gray-700 mb-4">
            We're constantly improving PutCall with new features and data sources:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Options Strategy Builder</strong> - Plan and visualize option strategies</li>
            <li>• <strong>Direct SEC EDGAR Parsing</strong> - Most authoritative insider trading data</li>
            <li>• <strong>API Access</strong> - Integrate PutCall data into your own tools</li>
            <li>• <strong>Newsletter Archive</strong> - Searchable history of all market briefs</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Start Tracking the Market
          </h2>
          <p className="text-gray-600 mb-6">
            Join investors using PutCall for smarter market research
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Dashboard
            </a>
            <a 
              href="/#newsletter" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Subscribe to Newsletter
            </a>
          </div>
        </div>

        {/* Contact/Feedback */}
        <div className="mt-16 text-center text-gray-600">
          <p>
            Questions or suggestions? We'd love to hear from you.
          </p>
          <p className="mt-2">
            Built with ❤️ for smarter investing
          </p>
        </div>
      </div>
    </div>
  );
}

