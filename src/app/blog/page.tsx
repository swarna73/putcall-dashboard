import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Insights Blog | PutCall.nl',
  description: 'Real-time stock analysis, insider trading insights, and market intelligence. Read our tri-weekly market briefs covering Reddit sentiment, fundamentals, and breaking news.',
  keywords: 'stock market analysis, insider trading, market intelligence, investment newsletter, reddit stock sentiment',
  openGraph: {
    title: 'Market Insights Blog | PutCall.nl',
    description: 'Real-time stock analysis and market intelligence',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Market Insights & Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            In-depth market intelligence combining Reddit sentiment, insider trading patterns, 
            and real-time fundamentals. Published Monday, Wednesday, and Friday.
          </p>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-16 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Get Market Briefs in Your Inbox
              </h2>
              <p className="text-blue-100">
                Tri-weekly updates every Monday, Wednesday, and Friday
              </p>
            </div>
            <a 
              href="/#newsletter" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe Free
            </a>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Newsletter Archive Coming Soon
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              We're building a searchable archive of all our market briefs. 
              In the meantime, subscribe to get insights delivered directly to your inbox.
            </p>

            {/* What to expect */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
              <div>
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-1">Market Analysis</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive coverage of trending stocks and sectors
                </p>
              </div>
              
              <div>
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-1">Insider Activity</h3>
                <p className="text-sm text-gray-600">
                  Track significant insider trading patterns and signals
                </p>
              </div>
              
              <div>
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-semibold text-gray-900 mb-1">Reddit Sentiment</h3>
                <p className="text-sm text-gray-600">
                  Real-time tracking of retail investor discussions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform features */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🎯 Real-Time Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Access live market data, insider trades, and sentiment tracking on our main dashboard.
            </p>
            <a 
              href="/" 
              className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center"
            >
              Explore Dashboard
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ❓ Learn More
            </h3>
            <p className="text-gray-600 mb-4">
              Discover how we track sentiment, fundamentals, and insider activity to power your research.
            </p>
            <a 
              href="/about" 
              className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center"
            >
              About PutCall
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
