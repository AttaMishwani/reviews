document.addEventListener("DOMContentLoaded", () => {

    // ─── Star Rating Logic ──────────────────────────────────────────────────────
    const stars = document.querySelectorAll(".star");
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
  
    // ─── Form Submission ────────────────────────────────────────────────────────
    document.getElementById("submitReview").addEventListener("click", async () => {
     console.log("form submitted")
  
  });


})