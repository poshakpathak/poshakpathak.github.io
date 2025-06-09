'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const rootElement = document.documentElement;

const setTheme = (isDark) => {
  if (isDark) {
    rootElement.classList.remove("light-theme");
    themeIcon.name = "moon-outline";
    localStorage.setItem("theme", "dark");
  } else {
    rootElement.classList.add("light-theme");
    themeIcon.name = "sunny-outline";
    localStorage.setItem("theme", "light");
  }
};

// Initial load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") setTheme(false);
else setTheme(true);

// Toggle event
themeToggleBtn.addEventListener("click", () => {
  const isCurrentlyDark = !rootElement.classList.contains("light-theme");
  setTheme(!isCurrentlyDark);
});

document.addEventListener('DOMContentLoaded', function() {
  // --- Project Modal Logic ---
  const projectModal = document.getElementById('project-modal');
  const projectModalOverlay = document.querySelector('.project-modal-overlay');
  const projectModalClose = document.querySelector('.project-modal-close');
  const projectModalImg = document.getElementById('modal-img');
  const projectModalTitle = document.getElementById('modal-title');
  const projectModalDesc = document.getElementById('modal-desc');
  const projectModalSkills = document.getElementById('modal-skills');
  const projectModalLink = document.getElementById('modal-link');

  // Add a container for the blog link if it doesn't exist
  let modalBlog = document.getElementById('modal-blog');
  if (!modalBlog) {
    modalBlog = document.createElement('div');
    modalBlog.id = 'modal-blog';
    modalBlog.style.margin = '0.5rem 0 1rem 0';
    modalBlog.style.fontSize = '1rem';
    modalBlog.style.textAlign = 'left';
    modalBlog.style.display = 'none';
    projectModalLink.parentNode.insertBefore(modalBlog, projectModalLink);
  }

  // Placeholder data for skills and links
  const projectData = [
    {
      title: 'BayesSurgeon',
      img: './assets/images/Breast.png',
      desc: 'This project analyzes the post-surgical data of breast cancer patients and identifies patterns in recovery, follow-up visits, and survival outcomes.',
      skills: ['Python', 'Statistics', 'Hypothesis Testing'],
      link: 'https://hacklytics-25.pages.dev/'
    },
    {
      title: 'Chess Engine',
      img: './assets/images/Chess.png',
      desc: 'This engine is developed using NN with 90% accuracy on 1562 games against stockfish 14. I have also employed Alpha-Beta pruning to optimize search to enhance the decision-making process.',
      skills: ['Python', 'Neural Networks', 'Alpha-Beta Pruning'],
      link: 'https://github.com/poshakpathak/ChessEngine'
    },
    {
      title: 'Pictionary Pugle',
      img: './assets/images/Pict.png',
      desc: 'This project was designed for the classification of drawn images into 15 categories. The main ML tool used here is hyperparameter tuning which utilizes Gaussian through Bayesian-Optimization to enhance the performance of the model.',
      skills: ['Python', 'Bayesian Optimization', 'Hyperparameter Tuning'],
      link: 'https://devpost.com/software/pictionary-pugle'
    },
    {
      title: 'Post Approval Prediction',
      img: './assets/images/Marky.png',
      desc: 'This was a hackathon project where we built a classification model to predict the approval status of social media posts generated by Marky— web application designed for promotional purposes.',
      skills: ['Python', 'Classification', 'Hackathon'],
      link: '#'
    },
    {
      title: 'Martingale Simulator',
      img: './assets/images/martingale.png',
      desc: 'A theoritically bulletproof, mathematically unsound and practically reliable strategy to gain an edge over the house.',
      skills: ['Python', 'Simulation', 'Probability'],
      link: 'Projects/margintale.html',
      blog: 'https://en.wikipedia.org/wiki/Martingale_(betting_system)' // placeholder blog link
    }
  ];

  function openProjectModal(idx) {
    const data = projectData[idx];
    projectModalImg.src = data.img;
    projectModalImg.alt = data.title;
    projectModalTitle.textContent = data.title;
    // For Martingale Simulator, append the blog link to the description
    if (data.title === 'Martingale Simulator' && data.blog) {
      let desc = data.desc.trim();
      if (desc.endsWith('.')) desc = desc.slice(0, -1);
      projectModalDesc.innerHTML = desc + '. Explore more about this <a href="' + data.blog + '" target="_blank" style="color:#e53935;text-decoration:underline;font-weight:500;">here.</a>';
    } else {
      projectModalDesc.textContent = data.desc;
    }
    projectModalSkills.innerHTML = data.skills.map(skill => `<span class=\"skill-pill\">${skill}</span>`).join(' ');
    projectModalLink.href = data.link;
    // Hide the modalBlog div for all cards now
    if (typeof modalBlog !== 'undefined') {
      modalBlog.style.display = 'none';
    }
    projectModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Attach event listeners to Details buttons
  const detailsBtns = document.querySelectorAll('.details-btn');
  detailsBtns.forEach((btn) => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-project-index'), 10);
      openProjectModal(idx);
    });
  });

  // Close modal on overlay or close button click
  projectModalOverlay.addEventListener('click', closeProjectModal);
  projectModalClose.addEventListener('click', closeProjectModal);
});
