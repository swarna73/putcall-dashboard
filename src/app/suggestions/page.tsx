export const metadata = {
  title: "Feature Suggestions | PutCall.nl",
  description: "Suggest new features and improvements for PutCall.nl",
};

export default function SuggestionsPage() {
  return (
    <main className="min-h-screen bg-[#020617] mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Feature Suggestions</h1>
        <p className="mt-2 text-sm text-slate-300">
          Have an idea to improve PutCall.nl? Drop it here. If it's popular, we'll prioritize it.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1221] p-3">
        <iframe
          src="https://tally.so/r/44KxOY?transparentBackground=1"
          className="h-[900px] w-full rounded-xl"
          frameBorder={0}
          title="PutCall.nl Feature Suggestions"
          style={{ background: 'transparent' }}
        />
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tip: include the ticker symbol (e.g., SPY) and a quick example of what you expect to see.
      </p>
    </main>
  );
}
