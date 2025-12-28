/**
 * ===========================
 *    ANIMATIONS MANAGER
 * ===========================
 */

class AnimationManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupParallax();
  }

  /**
   * Configuration de l'observateur d'intersection pour les animations au scroll
   */
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
        }
      });
    }, observerOptions);

    // Observer les éléments avec les classes d'animation
    const animatedElements = document.querySelectorAll([
      '.animate-on-scroll',
      '.stagger-animation',
      '.fade-in-up',
      '.slide-in-left',
      '.slide-in-right'
    ].join(', '));

    animatedElements.forEach(el => observer.observe(el));
    this.observers.set('intersection', observer);
  }

  /**
   * Déclenche les animations pour un élément
   */
  triggerAnimation(element) {
    const animationType = element.dataset.animation || 'fadeIn';
    const delay = parseInt(element.dataset.delay) || 0;

    setTimeout(() => {
      element.classList.add('animated');
      
      // Animation spéciale pour les éléments staggered
      if (element.classList.contains('stagger-animation')) {
        this.animateStaggered(element);
      }
    }, delay);
  }

  /**
   * Anime les éléments avec effet de décalage
   */
  animateStaggered(container) {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('animate-float');
      }, index * 100);
    });
  }

  /**
   * Configuration des animations de scroll
   */
  setupScrollAnimations() {
    let ticking = false;

    const updateScrollAnimations = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;

      // Animation du header
      const header = document.querySelector('.header');
      if (header) {
        if (scrollTop > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Animation parallax pour le background
      const body = document.body;
      if (body) {
        body.style.setProperty('--scroll-y', `${scrollTop * 0.5}px`);
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollAnimations);
        ticking = true;
      }
    });
  }

  /**
   * Configuration des effets de hover avancés
   */
  setupHoverEffects() {
    // Effet de suivi de curseur pour les cartes
    const cards = document.querySelectorAll('.card, .btn--primary');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });

    // Effet de glow pour les boutons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        this.createGlowEffect(button);
      });
    });
  }

  /**
   * Crée un effet de lueur pour un élément
   */
  createGlowEffect(element) {
    const glow = document.createElement('div');
    glow.className = 'glow-effect';
    glow.style.cssText = `
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #00d4ff, #8b5cf6, #ec4899);
      border-radius: inherit;
      z-index: -1;
      opacity: 0;
      filter: blur(10px);
      animation: glowPulse 2s ease-in-out infinite;
    `;

    element.style.position = 'relative';
    element.appendChild(glow);

    setTimeout(() => {
      glow.remove();
    }, 2000);
  }

  /**
   * Configuration du parallax
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    const updateParallax = () => {
      const scrollTop = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollTop * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateParallax);
    });
  }

  /**
   * Animation de chargement avec particules
   */
  createLoadingAnimation(container) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    
    container.appendChild(canvas);

    const particles = [];
    const particleCount = 50;

    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random(),
        decay: Math.random() * 0.02 + 0.005
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = 1;
        }

        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
    
    return canvas;
  }

  /**
   * Animation de typing effect
   */
  typeWriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const typing = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    };
    
    typing();
  }

  /**
   * Animation de compteur
   */
  animateCounter(element, start, end, duration = 2000) {
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(start + (end - start) * this.easeOutExpo(progress));
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  /**
   * Fonction d'easing
   */
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * Nettoyage des observateurs
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Styles CSS dynamiques pour les animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes glowPulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.8; }
  }
  
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
  }
  
  .animate-on-scroll.animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  .fade-in-up {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  
  .fade-in-up.animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  .slide-in-left {
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s ease-out;
  }
  
  .slide-in-left.animated {
    opacity: 1;
    transform: translateX(0);
  }
  
  .slide-in-right {
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.6s ease-out;
  }
  
  .slide-in-right.animated {
    opacity: 1;
    transform: translateX(0);
  }
`;

document.head.appendChild(styleSheet);

// Export pour utilisation dans d'autres modules
window.AnimationManager = AnimationManager;