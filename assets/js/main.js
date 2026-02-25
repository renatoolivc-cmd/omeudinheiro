/* ============================================
   omeudinheiro – Main JS
   ============================================ */

(function () {
  'use strict';

  // --- Mobile Menu ---
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !open);
      nav.classList.toggle('open');
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      });
    });
  }

  // --- Scroll fade-in ---
  const faders = document.querySelectorAll('.fade-in');
  if (faders.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    faders.forEach(function (el) { observer.observe(el); });
  }

  // --- Contact form ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var feedback = document.getElementById('contactFeedback');
      var nome = document.getElementById('ct_nome');
      var email = document.getElementById('ct_email');
      var assunto = document.getElementById('ct_assunto');
      var mensagem = document.getElementById('ct_mensagem');
      var valid = true;

      [nome, email, assunto, mensagem].forEach(function (f) { f.classList.remove('error'); });

      if (!nome.value.trim()) { nome.classList.add('error'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error'); valid = false;
      }
      if (!assunto.value) { assunto.classList.add('error'); valid = false; }
      if (!mensagem.value.trim()) { mensagem.classList.add('error'); valid = false; }

      if (!valid) {
        feedback.hidden = false;
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Por favor preenche todos os campos obrigatórios corretamente.';
        return;
      }

      feedback.hidden = false;
      feedback.className = 'form-feedback success';
      feedback.textContent = 'Obrigado pelo teu contacto! Entraremos em contacto contigo em breve.';
      contactForm.reset();
    });
  }
})();
