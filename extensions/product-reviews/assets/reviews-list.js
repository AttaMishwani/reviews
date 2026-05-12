const INITIAL_COUNT = 3;
let allReviews = [];

document.addEventListener("DOMContentLoaded", () => {
  loadReviews();

  document.getElementById("seeMoreBtn")?.addEventListener("click", () => {
    renderReviews(allReviews, true);
    document.getElementById("seeMoreWrapper").style.display = "none";
  });
});

async function loadReviews() {
  const productId = window.__productId;
 const shop = window.__shop
const payload = {
  productId:productId,
  shop : shop,
  intent : "GetReviews"
}
  try {
    const response = await fetch(
      `/apps/product-reviews` , {
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body : JSON.stringify(payload)
      },
   
    );
  
    if (response.ok) {
      const data = await response.json();
      allReviews = data.reviews || [];
      renderReviews(allReviews, false);
    }
  } catch (error) {
    console.error("Could not load reviews:", error);
  } }



function renderReviews(reviews, showAll) {
  const container = document.getElementById("reviewsList");
  const noReviews = document.getElementById("noReviews");
  const countEl = document.getElementById("reviewCount");
  const seeMoreWrapper = document.getElementById("seeMoreWrapper");

  if (!reviews || reviews.length === 0) {
    if (noReviews) noReviews.style.display = "block";
    if (countEl) countEl.textContent = "";
    return;
  }

  if (noReviews) noReviews.style.display = "none";
  if (countEl) countEl.textContent = `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`;

  // remove existing cards
  container.querySelectorAll(".rl-card").forEach((el) => el.remove());

  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_COUNT);

  visibleReviews.forEach((review) => {
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
        ${"★".repeat(review.rating)}<span>${"★".repeat(5 - review.rating)}</span>
      </div>
      <p class="rl-text">${review.text}</p>
    `;
    container.appendChild(card);
  });

  // show see more button if there are more than INITIAL_COUNT reviews
  if (!showAll && reviews.length > INITIAL_COUNT) {
    seeMoreWrapper.style.display = "block";
    document.getElementById("seeMoreBtn").textContent = `See All ${reviews.length} Reviews`;
  } else {
    seeMoreWrapper.style.display = "none";
  }
}