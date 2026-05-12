document.addEventListener("DOMContentLoaded", () => {

  const stars = document.querySelectorAll(".rf-star");
  const ratingInput = document.getElementById("ratingValue");

  stars.forEach((star) => {
    // hover effect
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.value) <= val);
      });
    });

    // reset on mouse leave if not selected
    star.addEventListener("mouseleave", () => {
      const selected = parseInt(ratingInput.value);
      stars.forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.value) <= selected);
      });
    });

    // select rating on click
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.value);
      ratingInput.value = val;
      stars.forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.value) <= val);
      });
    });
  });

  // char counter
  const textArea = document.getElementById("reviewText");
  const charCount = document.getElementById("charCount");
  if (textArea && charCount) {
    textArea.addEventListener("input", () => {
      charCount.textContent = textArea.value.length;
    });
  }

  document.getElementById("submitReview").addEventListener("click", async () => {
    await handlePostRequest();
  });

});

const handlePostRequest = async () => {
  const authorEl = document.getElementById("reviewAuthor");
  const textEl = document.getElementById("reviewText");
  const messageEl = document.getElementById("reviewMessage");
  const btn = document.getElementById("submitReview");

  const author = authorEl.value.trim();
  const text = textEl.value.trim();
  const rating = parseInt(document.getElementById("ratingValue").value, 10);
  const productId = window.__productId;
  // const appUrl = window.__appUrl;

  // ─── Validation ───────────────────────────────────────────────────────────
  if (!author) {
    messageEl.textContent = "Please enter your name.";
    messageEl.className = "rf-message error";
    return;
  }

  if (rating === 0) {
    messageEl.textContent = "Please select a star rating.";
    messageEl.className = "rf-message error";
    return;
  }

  if (!text) {
    messageEl.textContent = "Please write your review.";
    messageEl.className = "rf-message error";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Submitting...";
  messageEl.textContent = "";

  const payload = {
    productId,
    author,
    text,
    rating,
    date: new Date().toISOString().split("T")[0],
    shop: window.__shop,
  };

  console.log("Sending data:", payload);

  try {
    const response = await fetch(`/apps/product-reviews?productId=${productId}&shop=${window.__shop}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const reviewRes = await response.json();
      console.log("Response:", reviewRes);
      messageEl.textContent = "Thank you! Your review has been submitted.";
      messageEl.className = "rf-message success";

      // reset form
      authorEl.value = "";
      textEl.value = "";
      document.getElementById("ratingValue").value = "0";
      document.getElementById("charCount").textContent = "0";
      document.querySelectorAll(".rf-star").forEach((s) => s.classList.remove("active"));

      // reload reviews list if available
      if (typeof loadReviews === "function") loadReviews();
    } else {
      throw new Error("server error");
    }
  } catch (error) {
    console.error("Error:", error);
    messageEl.textContent = "Something went wrong. Please try again.";
    messageEl.className = "rf-message error";
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Review";
  }
};