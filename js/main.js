/* ============================================
   PREMIER ELEMENT — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Menu ---
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Header scroll effect ---
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Scroll animations (fade-in) ---
  var fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- FAQ Accordion ---
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        // Close all others
        faqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('active');
          }
        });
        // Toggle current
        item.classList.toggle('active');
      });
    }
  });

  // --- Contact Form ---
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Simple validation
      var prenom = document.getElementById('prenom').value.trim();
      var nom = document.getElementById('nom').value.trim();
      var email = document.getElementById('email').value.trim();
      var service = document.getElementById('service').value;
      var message = document.getElementById('message').value.trim();

      if (!prenom || !nom || !email || !service || !message) {
        return;
      }

      // Simulate form submission
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.textContent = 'Envoyer la demande';
        submitBtn.disabled = false;
        contactForm.reset();
        if (formSuccess) {
          formSuccess.classList.add('visible');
          setTimeout(function () {
            formSuccess.classList.remove('visible');
          }, 5000);
        }
      }, 1500);
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Stat counter animation ---
  var statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length > 0) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (stat) {
      statsObserver.observe(stat);
    });
  }

  function animateCounter(el) {
    var text = el.textContent.trim();
    var suffix = '';
    var target = 0;

    // Handle "24/7"
    if (text === '24/7') return;

    // Extract number and suffix
    var match = text.match(/^(\d+)(.*)$/);
    if (match) {
      target = parseInt(match[1], 10);
      suffix = match[2];
    } else {
      return;
    }

    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    el.textContent = '0' + suffix;
    window.requestAnimationFrame(step);
  }

});
