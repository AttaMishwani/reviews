const DUMMY_REVIEWS = [
  { id: 1, product: "Classic White T-Shirt", author: "Sarah M.", rating: 5, text: "Absolutely love this shirt! The fabric is super soft and the fit is perfect.", date: "2026-05-01" },
  { id: 2, product: "Running Shoes Pro", author: "James K.", rating: 4, text: "Great shoes for daily runs. Very comfortable and lightweight.", date: "2026-05-03" },
  { id: 3, product: "Classic White T-Shirt", author: "Priya N.", rating: 3, text: "Decent quality but the color faded after a few washes.", date: "2026-05-05" },
  { id: 4, product: "Leather Wallet", author: "Omar S.", rating: 5, text: "Premium quality leather. Exactly what I was looking for.", date: "2026-05-06" },
];

function Stars({ rating }) {
  return (
    <span className="text-sm tracking-wide">
      <span className="text-amber-400">{"★".repeat(rating)}</span>
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1">
      <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-3xl font-extrabold text-gray-900 leading-none">
        {value}
      </div>
      {sub && <div className="text-xs text-gray-300 mt-1.5">{sub}</div>}
    </div>
  );
}

export default function Overview({ shop }) {
  const total = DUMMY_REVIEWS.length;
  const avg = (DUMMY_REVIEWS.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const products = [...new Set(DUMMY_REVIEWS.map((r) => r.product))].length;

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">
          Overview
        </h2>
        <p className="text-[13px] text-gray-400">{shop}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-7">
        <StatCard label="Total Reviews" value={total} sub="all time" />
        <StatCard label="Average Rating" value={`${avg} / 5`} sub="across all products" />
        <StatCard label="Products Reviewed" value={products} sub="unique products" />
      </div>

      {/* Recent Reviews */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Recent Reviews</h3>
        </div>
        {DUMMY_REVIEWS.slice(0, 3).map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-4 px-6 py-4 ${i < 2 ? "border-b border-gray-50" : ""}`}
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-bold text-gray-500 shrink-0">
              {r.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-gray-900">{r.author}</span>
                <Stars rating={r.rating} />
              </div>
              <div className="text-xs text-gray-400 truncate">{r.text}</div>
            </div>
            <div className="text-[11px] text-gray-300 shrink-0">
              {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}