import { useRevalidator } from "react-router";

function Stars({ rating }) {
  return (
    <span className="text-sm tracking-wide">
      <span className="text-amber-400">{"★".repeat(rating)}</span>
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function RatingBadge({ rating }) {
  const styles =
    rating >= 4
      ? "bg-emerald-50 text-emerald-500"
      : rating === 3
      ? "bg-amber-50 text-amber-500"
      : "bg-red-50 text-red-500";

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles}`}>
      {rating}.0
    </span>
  );
}

export default function Reviews({ reviews = [] }) {
  const revalidator = useRevalidator();
  const isLoading = revalidator.state === "loading";

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">
            All Reviews
          </h2>
          <p className="text-[13px] text-gray-400">
            {reviews.length} reviews across all products
          </p>
        </div>
        <button
          onClick={() => revalidator.revalidate()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={isLoading ? "animate-spin inline-block" : ""}>↻</span>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-gray-400">Loading reviews...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reviews.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && (
        <div className="flex flex-col gap-3">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
            >
              {/* Product Info Bar */}
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                {review.productImage ? (
                  <img
                    src={review.productImage}
                    alt={review.productTitle}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                    📦
                  </div>
                )}
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {review.productTitle || "Unknown Product"}
                  </div>
                </div>
              </div>

              {/* Review Body */}
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {review.author?.charAt(0).toUpperCase()}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-sm font-bold text-gray-900">{review.author}</span>
                      <Stars rating={review.rating} />
                      <RatingBadge rating={review.rating} />
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed m-0">
                      {review.text}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-[11px] text-gray-300 shrink-0 mt-0.5">
                  {new Date(review.date).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}