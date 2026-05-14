const PAGE_SIZE = 5;

let allReviews = [];
let endCursor = null;
let hasNextPage = true;
let loading = false;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Product ID being used:", window.__productId);
  loadReviews(true);

  document.getElementById("seeMoreBtn")?.addEventListener("click", () => {
    loadMoreReviews();
  });
});

async function loadReviews(reset = false) {
  const productId = window.__productId;

  if (reset) {
    allReviews = [];
    endCursor = null;
    hasNextPage = true;
  }

  const payload = {
    productId,
    intent: "GetReviews",
    after: endCursor,
  };

  try {
    const response = await fetch(`/apps/product-reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    const newReviews = data?.reviews || [];

    // append new batch
    allReviews = [...newReviews, ...allReviews ];

    // update pagination info
    endCursor = data?.pageInfo?.endCursor;
    hasNextPage = data?.pageInfo?.hasNextPage;

    renderReviews(allReviews);
    updateButton();
  } catch (error) {
    console.error("Could not load reviews:", error);
  }
}

async function loadMoreReviews() {
  if (!hasNextPage || loading) return;

  loading = true;
  await loadReviews(false);
  loading = false;
}


function renderReviews(reviews) {
  const container = document.getElementById("reviewsList");
  const noReviews = document.getElementById("noReviews");
  const countEl = document.getElementById("reviewCount");

  if (!reviews || reviews.length === 0) {
    if (noReviews) noReviews.style.display = "block";
    if (countEl) countEl.textContent = "";
    return;
  }

  if (noReviews) noReviews.style.display = "none";
  if (countEl) {
    countEl.textContent = `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`;
  }

  container.querySelectorAll(".rl-card").forEach((el) => el.remove());

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "rl-card";

    card.innerHTML = `
      <div class="rl-card-top">
        <div class="rl-card-left">
          <div class="rl-avatar">${review.author?.charAt(0).toUpperCase()}</div>
          <span class="rl-author">${review.author}</span>
        </div>
        <span class="rl-date">${review.date}</span>
      </div>

      <div class="rl-stars">
        ${"★".repeat(review.rating)}
        <span>${"★".repeat(5 - review.rating)}</span>
      </div>

      <p class="rl-text">${review.text}</p>
    `;

    container.appendChild(card);
  });
}

function updateButton() {
  const wrapper = document.getElementById("seeMoreWrapper");
  const btn = document.getElementById("seeMoreBtn");

  if (!hasNextPage) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";
  btn.textContent = "Load More Reviews";
}

window.refreshReviews = () => {
  loadReviews(true);
};