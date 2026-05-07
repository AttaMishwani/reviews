const DUMMY_REVIEWS = [
  {
    id: 1,
    product: "Classic White T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop",
    productPrice: "$29.99",
    author: "Sarah M.",
    rating: 5,
    text: "Absolutely love this shirt! The fabric is super soft and the fit is perfect. Will definitely buy again.",
    date: "2026-05-01",
  },
  {
    id: 2,
    product: "Running Shoes Pro",
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    productPrice: "$89.99",
    author: "James K.",
    rating: 4,
    text: "Great shoes for daily runs. Very comfortable and lightweight. Only minus is the sizing runs a bit small.",
    date: "2026-05-03",
  },
  {
    id: 3,
    product: "Classic White T-Shirt",
    productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop",
    productPrice: "$29.99",
    author: "Priya N.",
    rating: 3,
    text: "Decent quality but the color faded after a few washes. Expected better for the price.",
    date: "2026-05-05",
  },
  {
    id: 4,
    product: "Leather Wallet",
    productImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&h=80&fit=crop",
    productPrice: "$49.99",
    author: "Omar S.",
    rating: 5,
    text: "Premium quality leather. Slim design fits perfectly in my pocket. Exactly what I was looking for.",
    date: "2026-05-06",
  },
  {
    id: 5,
    product: "Running Shoes Pro",
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    productPrice: "$89.99",
    author: "Fatima R.",
    rating: 2,
    text: "The shoes look great but the sole started peeling after 2 weeks of use. Disappointed.",
    date: "2026-05-07",
  },
];

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

export default function Reviews() {
  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">
          All Reviews
        </h2>
        <p className="text-[13px] text-gray-400">
          {DUMMY_REVIEWS.length} reviews across all products
        </p>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-3">
        {DUMMY_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            {/* Product Info Bar */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <img
                src={review.productImage}
                alt={review.product}
                className="w-9 h-9 rounded-lg object-cover border border-gray-200"
              />
              <div>
                <div className="text-[13px] font-semibold text-gray-900">
                  {review.product}
                </div>
                <div className="text-[11px] text-gray-400">{review.productPrice}</div>
              </div>
            </div>

            {/* Review Body */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {review.author.charAt(0)}
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
    </div>
  );
}