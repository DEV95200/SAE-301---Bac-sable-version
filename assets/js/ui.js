/**
 * ===========================
 *      UI INTERACTIONS
 * ===========================
 */

class UIManager {
  constructor() {
    this.sidebarOpen = false;
    this.mobileMenuOpen = false;
    this.currentTheme = 'dark';
    this.init();
  }

  init() {
    this.setupSidebar();
    this.setupMobileMenu();
    this.setupModals();
    this.setupTooltips();
    this.setupCustomSelects();
    this.setupSearchFunctionality();
    this.bindEvents();
  }

  /**
   * Configuration de la sidebar
   */
  setupSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Fermer la sidebar avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sidebarOpen) {
        this.closeSidebar();
      }
    });

    // Fermer la sidebar en cliquant sur la carte (mobile)
    if (mapContainer) {
      mapContainer.addEventListener('click', () => {
        if (window.innerWidth <= 768 && this.sidebarOpen) {
          this.closeSidebar();
        }
      });
    }
  }

  toggleSidebar() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mapContainer = document.querySelector('.map-container');

    if (sidebar) sidebar.classList.add('active');
    if (sidebarToggle) sidebarToggle.classList.add('active');
    if (mapContainer) mapContainer.classList.add('sidebar-open');
    
    this.sidebarOpen = true;
    
    // Trigger resize event for Leaflet
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mapContainer = document.querySelector('.map-container');

    if (sidebar) sidebar.classList.remove('active');
    if (sidebarToggle) sidebarToggle.classList.remove('active');
    if (mapContainer) mapContainer.classList.remove('sidebar-open');
    
    this.sidebarOpen = false;
    
    // Trigger resize event for Leaflet
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  /**
   * Configuration du menu mobile
   */
  setupMobileMenu() {
    const burgerButton = document.querySelector('.header__burger');
    const mobileNav = document.querySelector('.header__nav');

    if (burgerButton) {
      burgerButton.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Fermer le menu en cliquant sur un lien
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });
  }

  toggleMobileMenu() {
    const burgerButton = document.querySelector('.header__burger');
    const mobileNav = document.querySelector('.header__nav');

    if (this.mobileMenuOpen) {
      burgerButton?.classList.remove('active');
      mobileNav?.classList.remove('active');
      this.mobileMenuOpen = false;
    } else {
      burgerButton?.classList.add('active');
      mobileNav?.classList.add('active');
      this.mobileMenuOpen = true;
    }
  }

  closeMobileMenu() {
    const burgerButton = document.querySelector('.header__burger');
    const mobileNav = document.querySelector('.header__nav');
    
    burgerButton?.classList.remove('active');
    mobileNav?.classList.remove('active');
    this.mobileMenuOpen = false;
  }

  /**
   * Configuration des modales
   */
  setupModals() {
    // Ouvrir les modales
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (trigger) {
        const modalId = trigger.dataset.modal;
        this.openModal(modalId);
      }
    });

    // Fermer les modales
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal__close');
      const overlay = e.target.closest('.modal-overlay');
      
      if (closeBtn || (overlay && !e.target.closest('.modal'))) {
        this.closeModal();
      }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Configuration des tooltips
   */
  setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      const tooltipText = element.dataset.tooltip;
      
      // Créer le tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip__content';
      tooltip.textContent = tooltipText;
      
      element.classList.add('tooltip');
      element.appendChild(tooltip);
      
      // Position du tooltip
      element.addEventListener('mouseenter', () => {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Ajuster la position si le tooltip sort de l'écran
        if (rect.left + tooltipRect.width > window.innerWidth) {
          tooltip.style.left = 'auto';
          tooltip.style.right = '0';
        }
        
        if (rect.top - tooltipRect.height < 0) {
          tooltip.style.bottom = 'auto';
          tooltip.style.top = '125%';
        }
      });
    });
  }

  /**
   * Configuration des selects personnalisés
   */
  setupCustomSelects() {
    const selects = document.querySelectorAll('.custom-select select');
    
    selects.forEach(select => {
      // Ajouter des effets sonores (optionnel)
      select.addEventListener('change', () => {
        this.createRippleEffect(select);
      });
      
      select.addEventListener('focus', () => {
        select.parentElement.classList.add('focused');
      });
      
      select.addEventListener('blur', () => {
        select.parentElement.classList.remove('focused');
      });
    });
  }

  /**
   * Effet de ripple pour les interactions
   */
  createRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.4);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: 50%;
      top: 50%;
      margin-left: -${size/2}px;
      margin-top: -${size/2}px;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Fonctionnalité de recherche
   */
  setupSearchFunctionality() {
    const searchInput = document.querySelector('#search-input');
    const searchResults = document.querySelector('#search-results');
    
    if (searchInput) {
      let searchTimeout;
      
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
          this.hideSearchResults();
          return;
        }
        
        searchTimeout = setTimeout(() => {
          this.performSearch(query);
        }, 300);
      });
      
      // Fermer les résultats en cliquant ailleurs
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
          this.hideSearchResults();
        }
      });
    }
  }

  /**
   * Effectuer une recherche
   */
  performSearch(query) {
    // Cette fonction sera étendue selon les besoins
    console.log('Recherche:', query);
    // Implémenter la logique de recherche ici
  }

  hideSearchResults() {
    const searchResults = document.querySelector('#search-results');
    if (searchResults) {
      searchResults.style.display = 'none';
    }
  }

  /**
   * Notification toast
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__content">
        <span class="toast__message">${message}</span>
        <button class="toast__close">&times;</button>
      </div>
    `;
    
    // Styles pour le toast
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(26, 31, 46, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid var(--accent-neon);
      border-radius: 8px;
      padding: 16px;
      color: white;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    // Fermer avec le bouton
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => {
      this.hideToast(toast);
    });
    
    // Fermer automatiquement
    if (duration > 0) {
      setTimeout(() => {
        this.hideToast(toast);
      }, duration);
    }
    
    return toast;
  }

  hideToast(toast) {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  /**
   * Gestion des événements globaux
   */
  bindEvents() {
    // Redimensionnement de fenêtre
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Gestion du clavier
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }

  handleResize() {
    // Fermer la sidebar sur mobile si elle est ouverte
    if (window.innerWidth <= 768 && this.sidebarOpen) {
      this.closeSidebar();
    }
    
    // Fermer le menu mobile si on passe en desktop
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  handleKeyboard(e) {
    // Shortcuts clavier
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'k':
          e.preventDefault();
          // Focus sur la recherche
          const searchInput = document.querySelector('#search-input');
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case 'b':
          e.preventDefault();
          this.toggleSidebar();
          break;
      }
    }
  }
}

// Styles CSS pour les éléments dynamiques
const uiStyles = document.createElement('style');
uiStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .custom-select.focused {
    transform: scale(1.02);
  }
  
  .toast--success {
    border-color: #22c55e !important;
  }
  
  .toast--warning {
    border-color: #fbbf24 !important;
  }
  
  .toast--error {
    border-color: #ef4444 !important;
  }
  
  .toast__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  
  .toast__close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toast__close:hover {
    color: white;
  }
`;

document.head.appendChild(uiStyles);

// Export pour utilisation globale
window.UIManager = UIManager;