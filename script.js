// ===============================
// Q&A Smooth Toggle System
// ===============================

const questions = document.querySelectorAll(".qa-question");

questions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;

    // Toggle Answer Open/Close
    answer.classList.toggle("open");

    // Toggle Arrow Rotation
    btn.classList.toggle("active");
  });
});

//Reveal Animation//
const reveals = document.querySelectorAll(".reveal");

function scrollReveal() {
  reveals.forEach((section) => {
    const windowHeight = window.innerHeight;
    const sectionTop = section.getBoundingClientRect().top;
    const revealPoint = 120;

    if (sectionTop < windowHeight - revealPoint) {
      section.classList.add("active");
    }
  });
}

window.addEventListener("scroll", scrollReveal);
scrollReveal();

// Menu fix
const toggle = document.getElementById("menuToggle");
const dropdown = document.getElementById("menuDropdown");

toggle.addEventListener("click", () => {
  dropdown.style.display =
    dropdown.style.display === "flex" ? "none" : "flex";
});