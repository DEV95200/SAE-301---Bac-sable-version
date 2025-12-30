// Gestionnaire de géolocalisation avancée pour CinéMap IDF
class GeolocationManager {
  constructor(app) {
    this.app = app;
    this.userPosition = null;
    this.watchId = null;
    this.searchRadius = 5; // km par défaut
    this.isTracking = false;
    this.nearestCinemas = [];
    this.preferences = this.loadPreferences();
    this.init();
  }

  init() {
    this.createGeolocationPanel();
    this.setupEventListeners();
    this.checkLocationPermission();
  }

  createGeolocationPanel() {
    const existingPanel = document.getElementById('geolocation-panel');
    if (existingPanel) existingPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'geolocation-panel';
    panel.className = 'geolocation-panel hidden';
    panel.innerHTML = `
      <div class="panel-header">
        <h3><i class="fas fa-location-arrow"></i> Cinémas à proximité</h3>
        <button id="close-geo-panel" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="panel-content">
        <!-- Configuration de recherche -->
        <div class="search-config">
          <div class="config-group">
            <label>Rayon de recherche</label>
            <div class="radius-selector">
              <input type="range" id="search-radius" min="1" max="50" value="5" step="1">
              <span id="radius-value">5 km</span>
            </div>
          </div>

          <div class="config-group">
            <label>Options avancées</label>
            <div class="advanced-options">
              <label class="checkbox-label">
                <input type="checkbox" id="only-open" ${this.preferences.onlyOpen ? 'checked' : ''}>
                <span>Seulement les cinémas ouverts maintenant</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" id="has-parking" ${this.preferences.hasParking ? 'checked' : ''}>
                <span>Avec parking disponible</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" id="accessible" ${this.preferences.accessible ? 'checked' : ''}>
                <span>Accessibles PMR</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" id="art-et-essai" ${this.preferences.artEtEssai ? 'checked' : ''}>
                <span>Cinémas Art et Essai uniquement</span>
              </label>
            </div>
          </div>

          <div class="config-group">
            <label>Prix maximum</label>
            <div class="price-selector">
              <input type="range" id="max-price" min="0" max="25" value="${this.preferences.maxPrice || 25}" step="0.5">
              <span id="price-value">${this.preferences.maxPrice || 25}€</span>
            </div>
          </div>

          <div class="config-group">
            <label>Services recherchés</label>
            <div class="services-selector">
              <button class="service-btn ${this.preferences.services.includes('IMAX') ? 'active' : ''}" data-service="IMAX">
                IMAX
              </button>
              <button class="service-btn ${this.preferences.services.includes('4DX') ? 'active' : ''}" data-service="4DX">
                4DX
              </button>
              <button class="service-btn ${this.preferences.services.includes('3D') ? 'active' : ''}" data-service="3D">
                3D
              </button>
              <button class="service-btn ${this.preferences.services.includes('VIP') ? 'active' : ''}" data-service="VIP">
                VIP
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="panel-actions">
          <button id="find-nearest" class="primary-btn">
            <i class="fas fa-search-location"></i>
            Trouver les cinémas
          </button>
          
          <button id="track-position" class="secondary-btn">
            <i class="fas fa-crosshairs"></i>
            <span id="track-text">Suivre ma position</span>
          </button>
          
          <button id="save-preferences" class="tertiary-btn">
            <i class="fas fa-save"></i>
            Sauvegarder préférences
          </button>
        </div>

        <!-- Status -->
        <div id="geo-status" class="status-info">
          <i class="fas fa-info-circle"></i>
          <span>Cliquez sur "Trouver les cinémas" pour commencer</span>
        </div>

        <!-- Résultats -->
        <div id="nearest-results" class="results-container">
          <!-- Les résultats seront insérés ici -->
        </div>
      </div>
    `;

    document.body.appendChild(panel);
  }

  setupEventListeners() {
    // Bouton principal de géolocalisation
    const mainGeoBtn = document.getElementById('geolocation-btn');
    mainGeoBtn.addEventListener('click', () => this.togglePanel());

    // Fermer le panneau
    document.getElementById('close-geo-panel').addEventListener('click', () => this.hidePanel());

    // Slider de rayon
    const radiusSlider = document.getElementById('search-radius');
    radiusSlider.addEventListener('input', (e) => {
      this.searchRadius = parseInt(e.target.value);
      document.getElementById('radius-value').textContent = `${this.searchRadius} km`;
      this.updateSearch();
    });

    // Slider de prix
    const priceSlider = document.getElementById('max-price');
    priceSlider.addEventListener('input', (e) => {
      const price = parseFloat(e.target.value);
      document.getElementById('price-value').textContent = `${price}€`;
      this.preferences.maxPrice = price;
      this.updateSearch();
    });

    // Services
    document.querySelectorAll('.service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        this.updatePreferences();
        this.updateSearch();
      });
    });

    // Checkboxes
    document.querySelectorAll('.advanced-options input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updatePreferences();
        this.updateSearch();
      });
    });

    // Actions
    document.getElementById('find-nearest').addEventListener('click', async () => {
      await this.findNearestCinemas();
      // Notification seulement pour le clic manuel du bouton
      if (this.nearestCinemas.length > 0) {
        window.ToastManager.show(
          `${this.nearestCinemas.length} cinéma(s) trouvé(s) dans un rayon de ${this.searchRadius} km`,
          'success'
        );
      } else {
        window.ToastManager.show(
          `Aucun cinéma trouvé dans un rayon de ${this.searchRadius} km`,
          'warning'
        );
      }
    });
    document.getElementById('track-position').addEventListener('click', () => this.toggleTracking());
    document.getElementById('save-preferences').addEventListener('click', () => this.savePreferences());
  }

  async togglePanel() {
    const panel = document.getElementById('geolocation-panel');
    if (panel.classList.contains('hidden')) {
      await this.showPanel();
    } else {
      this.hidePanel();
    }
  }

  async showPanel() {
    const panel = document.getElementById('geolocation-panel');
    panel.classList.remove('hidden');
    
    // Animation d'entrée
    setTimeout(() => panel.classList.add('show'), 10);

    // Vérifier les permissions automatiquement
    if (!this.userPosition) {
      await this.getCurrentPosition();
    }
  }

  hidePanel() {
    const panel = document.getElementById('geolocation-panel');
    panel.classList.remove('show');
    setTimeout(() => panel.classList.add('hidden'), 300);
  }

  async getCurrentPosition() {
    try {
      this.updateStatus('Localisation en cours...', 'loading');
      
      const position = await window.GeoUtils.getUserLocation();
      this.userPosition = position;
      
      this.updateStatus(`Position trouvée: ${position.accuracy}m de précision`, 'success');
      
      // Centrer la carte sur la position de l'utilisateur
      if (window.mapManager) {
        window.mapManager.centerOnPosition(position.latitude, position.longitude);
        window.mapManager.addUserMarker(position.latitude, position.longitude);
      }

      return position;
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      this.updateStatus(`Erreur: ${error.message}`, 'error');
      throw error;
    }
  }

  async findNearestCinemas() {
    try {
      if (!this.userPosition) {
        await this.getCurrentPosition();
      }

      this.updateStatus('Recherche des cinémas à proximité...', 'loading');

      // Calculer les distances et filtrer
      const cinemasWithDistance = this.app.cinemas
        .map(cinema => ({
          ...cinema,
          distance: window.GeoUtils.calculateDistance(
            this.userPosition.latitude,
            this.userPosition.longitude,
            cinema.latitude,
            cinema.longitude
          )
        }))
        .filter(cinema => cinema.distance <= this.searchRadius)
        .filter(cinema => this.matchesFilters(cinema))
        .sort((a, b) => a.distance - b.distance);

      this.nearestCinemas = cinemasWithDistance;

      if (this.nearestCinemas.length === 0) {
        this.updateStatus(`Aucun cinéma trouvé dans un rayon de ${this.searchRadius} km`, 'warning');
      } else {
        this.updateStatus(`${this.nearestCinemas.length} cinéma(s) trouvé(s)`, 'success');
        this.displayResults();
        
        // Mettre à jour la carte
        if (window.mapManager) {
          window.mapManager.showNearestCinemas(this.nearestCinemas, this.userPosition, this.searchRadius);
        }
      }

      // PAS de notification automatique ici - seulement pour les actions manuelles

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      this.updateStatus('Erreur lors de la recherche', 'error');
    }
  }

  matchesFilters(cinema) {
    // Filtre par prix
    if (this.preferences.maxPrice && cinema.prix_moyen > this.preferences.maxPrice) {
      return false;
    }

    // Filtre cinéma ouvert maintenant
    if (this.preferences.onlyOpen && !this.isCinemaOpen(cinema)) {
      return false;
    }

    // Filtre parking
    if (this.preferences.hasParking && !cinema.parking) {
      return false;
    }

    // Filtre accessibilité
    if (this.preferences.accessible && !cinema.accessibilite) {
      return false;
    }

    // Filtre Art et Essai
    if (this.preferences.artEtEssai && cinema.art_et_essai !== 'oui') {
      return false;
    }

    // Filtre services
    if (this.preferences.services.length > 0) {
      const hasService = this.preferences.services.some(service => 
        cinema.services && cinema.services.includes(service)
      );
      if (!hasService) return false;
    }

    return true;
  }

  isCinemaOpen(cinema) {
    if (!cinema.horaires) return true; // Si pas d'horaires, on suppose ouvert

    const now = new Date();
    const currentDay = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = cinema.horaires[currentDay];
    if (!todayHours || todayHours === 'Fermé') return false;

    // Parser les horaires (format: "14:00-22:30")
    const [start, end] = todayHours.split('-');
    if (!start || !end) return true;

    const [startH, startM] = start.split(':').map(n => parseInt(n));
    const [endH, endM] = end.split(':').map(n => parseInt(n));

    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    return currentTime >= startTime && currentTime <= endTime;
  }

  displayResults() {
    const container = document.getElementById('nearest-results');
    container.innerHTML = '';

    if (this.nearestCinemas.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-map-marker-slash"></i>
          <p>Aucun cinéma trouvé avec vos critères</p>
        </div>
      `;
      return;
    }

    this.nearestCinemas.forEach((cinema, index) => {
      const card = this.createCinemaCard(cinema, index + 1);
      container.appendChild(card);
    });
  }

  createCinemaCard(cinema, rank) {
    const card = document.createElement('div');
    card.className = 'proximity-card';
    
    const isOpen = this.isCinemaOpen(cinema);
    const walkingTime = Math.ceil(cinema.distance / 5 * 60); // 5km/h vitesse de marche
    const drivingTime = Math.ceil(cinema.distance / 30 * 60); // 30km/h vitesse en ville

    card.innerHTML = `
      <div class="card-header">
        <div class="rank-badge">#${rank}</div>
        <h4 class="cinema-name">${cinema.nom}</h4>
        <div class="status-badge ${isOpen ? 'open' : 'closed'}">
          ${isOpen ? 'Ouvert' : 'Fermé'}
        </div>
      </div>

      <div class="card-content">
        <div class="distance-info">
          <div class="distance-main">
            <i class="fas fa-route"></i>
            <span class="distance">${window.GeoUtils.formatDistance(cinema.distance)}</span>
          </div>
          <div class="time-estimates">
            <span class="walking-time">
              <i class="fas fa-walking"></i>
              ${walkingTime} min à pied
            </span>
            <span class="driving-time">
              <i class="fas fa-car"></i>
              ${drivingTime} min en voiture
            </span>
          </div>
        </div>

        <div class="cinema-info">
          <div class="address">
            <i class="fas fa-map-marker-alt"></i>
            ${cinema.adresse}
          </div>
          
          <div class="details">
            <span class="screens">
              <i class="fas fa-tv"></i>
              ${cinema.ecrans} écran${cinema.ecrans > 1 ? 's' : ''}
            </span>
            
            ${cinema.prix_moyen ? `
              <span class="price">
                <i class="fas fa-euro-sign"></i>
                ${cinema.prix_moyen}€
              </span>
            ` : ''}
            
            ${cinema.note ? `
              <span class="rating">
                <i class="fas fa-star"></i>
                ${cinema.note}/5
              </span>
            ` : ''}
          </div>

          ${cinema.services && cinema.services.length > 0 ? `
            <div class="services">
              ${cinema.services.slice(0, 3).map(service => 
                `<span class="service-tag">${service}</span>`
              ).join('')}
              ${cinema.services.length > 3 ? `<span class="more-services">+${cinema.services.length - 3}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="card-actions">
        <button class="action-btn primary" onclick="window.geolocationManager.navigateTo(${cinema.latitude}, ${cinema.longitude}, '${cinema.nom}')">
          <i class="fas fa-directions"></i>
          Itinéraire
        </button>
        
        <button class="action-btn secondary" onclick="window.geolocationManager.showDetails(${cinema.id})">
          <i class="fas fa-info-circle"></i>
          Détails
        </button>
        
        ${cinema.telephone ? `
          <button class="action-btn tertiary" onclick="window.geolocationManager.callCinema('${cinema.telephone}')">
            <i class="fas fa-phone"></i>
            Appeler
          </button>
        ` : ''}
      </div>
    `;

    return card;
  }

  navigateTo(lat, lng, name) {
    // Afficher l'itinéraire sur la carte interne
    if (window.mapManager && this.userPosition) {
      // Basculer vers la vue carte si on n'y est pas
      if (this.app.currentView !== 'map') {
        this.app.switchView('map');
      }

      // Fermer le panneau de géolocalisation
      this.hidePanel();

      // Créer l'itinéraire sur la carte
      window.mapManager.showRouteToDestination(
        this.userPosition.latitude, 
        this.userPosition.longitude, 
        lat, 
        lng, 
        name
      );

      // Notification de succès
      window.ToastManager.show(`Itinéraire vers ${name} affiché sur la carte`, 'success');
    } else {
      // Fallback vers Google Maps si pas de position utilisateur
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      let url;
      if (isMobile) {
        if (isIOS) {
          url = `maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`;
        } else {
          url = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
        }
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
      }
      
      window.open(url, '_blank');
      window.ToastManager.show(`Ouverture de l'itinéraire vers ${name}`, 'info');
    }
  }

  showDetails(cinemaId) {
    console.log('Tentative d\'ouverture des détails pour le cinéma ID:', cinemaId);
    console.log('Type de cinemaId:', typeof cinemaId);
    console.log('App disponible:', !!this.app);
    console.log('Cinemas disponibles:', !!this.app.cinemas);
    console.log('Nombre de cinémas:', this.app.cinemas ? this.app.cinemas.length : 0);
    
    // Convertir l'ID en nombre
    const numericId = parseInt(cinemaId);
    console.log('ID numérique:', numericId);
    
    const cinema = this.app.cinemas.find(c => {
      console.log('Comparaison: cinema.id =', c.id, ', recherché =', numericId);
      return c.id === numericId;
    });
    
    if (cinema) {
      console.log('Cinéma trouvé:', cinema.nom);
      
      // Vérifier si cinemaApp existe et a la méthode showCinemaDetails
      if (window.cinemaApp && typeof window.cinemaApp.showCinemaDetails === 'function') {
        console.log('Méthode showCinemaDetails trouvée');
        
        // Fermer le panneau de géolocalisation
        this.hidePanel();
        
        // Attendre un peu que le panneau se ferme puis ouvrir la modal
        setTimeout(() => {
          window.cinemaApp.showCinemaDetails(cinema.id);
        }, 300);
        
        window.ToastManager.show(`Ouverture des détails de ${cinema.nom}`, 'info');
      } else {
        console.error('cinemaApp ou showCinemaDetails non disponible');
        console.log('window.cinemaApp:', !!window.cinemaApp);
        console.log('showCinemaDetails method:', typeof (window.cinemaApp && window.cinemaApp.showCinemaDetails));
        window.ToastManager.show('Erreur: Fonctionnalité non disponible', 'error');
      }
    } else {
      console.error('Cinéma non trouvé avec l\'ID:', numericId);
      console.log('IDs disponibles:', this.app.cinemas.map(c => c.id));
      window.ToastManager.show('Erreur: Cinéma non trouvé', 'error');
    }
  }

  callCinema(phone) {
    window.location.href = `tel:${phone}`;
    window.ToastManager.show('Appel en cours...', 'info');
  }

  toggleTracking() {
    const btn = document.getElementById('track-position');
    const text = document.getElementById('track-text');

    if (!this.isTracking) {
      this.startTracking();
      btn.classList.add('active');
      text.textContent = 'Arrêter le suivi';
      this.updateStatus('Suivi de position activé', 'success');
    } else {
      this.stopTracking();
      btn.classList.remove('active');
      text.textContent = 'Suivre ma position';
      this.updateStatus('Suivi de position désactivé', 'info');
    }
  }

  startTracking() {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.userPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Mettre à jour la carte
        if (window.mapManager) {
          window.mapManager.updateUserPosition(this.userPosition.latitude, this.userPosition.longitude);
        }

        // Relancer la recherche si nécessaire
        if (this.nearestCinemas.length > 0) {
          this.updateSearch();
        }
      },
      (error) => {
        console.error('Erreur de suivi:', error);
        this.stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 15000
      }
    );

    this.isTracking = true;
  }

  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  updateSearch() {
    if (this.userPosition && this.nearestCinemas.length > 0) {
      this.findNearestCinemas();
    }
  }

  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('geo-status');
    const iconClasses = {
      loading: 'fa-spinner fa-spin',
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    statusEl.innerHTML = `
      <i class="fas ${iconClasses[type]}"></i>
      <span>${message}</span>
    `;
    statusEl.className = `status-info ${type}`;
  }

  updatePreferences() {
    this.preferences = {
      onlyOpen: document.getElementById('only-open').checked,
      hasParking: document.getElementById('has-parking').checked,
      accessible: document.getElementById('accessible').checked,
      artEtEssai: document.getElementById('art-et-essai').checked,
      maxPrice: parseFloat(document.getElementById('max-price').value),
      services: Array.from(document.querySelectorAll('.service-btn.active')).map(btn => btn.dataset.service)
    };
  }

  savePreferences() {
    this.updatePreferences();
    window.StorageManager.setItem('geolocation_preferences', this.preferences);
    window.ToastManager.show('Préférences sauvegardées', 'success');
  }

  loadPreferences() {
    return window.StorageManager.getItem('geolocation_preferences', {
      onlyOpen: false,
      hasParking: false,
      accessible: false,
      artEtEssai: false,
      maxPrice: 25,
      services: []
    });
  }

  checkLocationPermission() {
    if (!navigator.geolocation) {
      this.updateStatus('Géolocalisation non supportée par votre navigateur', 'error');
      return;
    }

    // Vérifier les permissions
    if (navigator.permissions) {
      navigator.permissions.query({name: 'geolocation'}).then((result) => {
        if (result.state === 'denied') {
          this.updateStatus('Permission de géolocalisation refusée', 'error');
        } else if (result.state === 'prompt') {
          this.updateStatus('Cliquez pour autoriser la géolocalisation', 'info');
        }
      });
    }
  }

  // Cleanup
  destroy() {
    this.stopTracking();
    const panel = document.getElementById('geolocation-panel');
    if (panel) panel.remove();
  }
}

// Export global
window.GeolocationManager = GeolocationManager;