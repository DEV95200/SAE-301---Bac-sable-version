
// Simple Cinema Map
class SimpleCinemaMap {
  constructor() {
    this.map = null;
    this.markerCluster = null;
    this.cinemaData = [];
    
    this.init();
  }

  async init() {
    try {
      this.initializeMap();
      await this.loadCinemaData();
      this.addMarkersToMap();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    }
  }

  initializeMap() {
    // Créer la carte centrée sur l'Île-de-France
    this.map = L.map('map').setView([48.8566, 2.3522], 10);
    
    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Initialiser le cluster
    this.markerCluster = L.markerClusterGroup();
    this.map.addLayer(this.markerCluster);
  }

  async loadCinemaData() {
    try {
      const response = await fetch('include/cinema.json');
      this.cinemaData = await response.json();
      console.log('Données cinéma chargées:', this.cinemaData.length);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  addMarkersToMap() {
    this.markerCluster.clearLayers();
    
    this.cinemaData.forEach(cinema => {
      if (cinema.lat && cinema.lng) {
        const marker = L.marker([cinema.lat, cinema.lng]);
        
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">${cinema.nom}</h3>
            <p style="margin: 0 0 5px 0; color: #666;">${cinema.adresse}</p>
            <p style="margin: 0; color: #999; font-size: 12px;">
              ${cinema.ville} (${cinema.departement})
            </p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        this.markerCluster.addLayer(marker);
      }
    });
  }
}

// Initialiser la carte quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
  const cinemaMap = new SimpleCinemaMap();
}); {
      console.error('❌ Erreur lors de l\'initialisation de la carte:', error);
      this.showError('Erreur de chargement de la carte');
    }
  }

  /**
   * Initialise la carte Leaflet
   */
  initializeMap() {
    // Configuration optimisée pour le thème néon
    this.map = L.map('map', {
      center: [48.8566, 2.3522],
      zoom: 10,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
      worldCopyJump: true
    });

    // Position du contrôle de zoom
    this.map.zoomControl.setPosition('topright');
    
    console.log('✅ Carte initialisée');
  }

  /**
   * Configure les couches de carte
   */
  setupLayers() {
    // Couche OpenStreetMap classique
    this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      className: 'map-tiles'
    });

    // Couche satellite
    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
        className: 'map-tiles'
      }
    );

    // Couche sombre pour le thème néon
    this.darkLayer = L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        className: 'map-tiles-dark'
      }
    );

    // Configuration des clusters avec style néon
    this.markerCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: this.createCustomClusterIcon,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 15
    });

    this.map.addLayer(this.markerCluster);

    // Appliquer la couche par défaut
    this.applyMapStyle('osm');
    
    console.log('✅ Couches configurées');
  }

  /**
   * Crée une icône de cluster personnalisée avec style néon
   */
  createCustomClusterIcon(cluster) {
    const count = cluster.getChildCount();
    let className = 'marker-cluster-small';
    
    if (count < 10) {
      className = 'marker-cluster-small';
    } else if (count < 100) {
      className = 'marker-cluster-medium';
    } else {
      className = 'marker-cluster-large';
    }
    
    return new L.DivIcon({
      html: `<div><span>${count}</span></div>`,
      className: `marker-cluster ${className}`,
      iconSize: new L.Point(40, 40)
    });
  }

  /**
   * Configure les éléments UI
   */
  setupUI() {
    this.mapStyleSelect = document.getElementById('map-style-select');
    this.depSelect = document.getElementById('departement-select');
    this.loadingElement = document.getElementById('map-loading');
    
    console.log('✅ UI configurée');
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Style de carte
    if (this.mapStyleSelect) {
      this.mapStyleSelect.addEventListener('change', (e) => {
        this.applyMapStyle(e.target.value);
      });
    }

    // Filtre département
    if (this.depSelect) {
      this.depSelect.addEventListener('change', (e) => {
        this.filterByDepartment(e.target.value);
      });
    }

    // Redimensionnement responsive
    window.addEventListener('resize', () => {
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
      }
    });
    
    console.log('✅ Événements configurés');
  }

  /**
   * Configure les événements de la carte
   */
  setupMapEvents() {
    // Événements de zoom avec effets
    this.map.on('zoomstart', () => {
      this.map.getContainer().classList.add('zooming');
    });

    this.map.on('zoomend', () => {
      setTimeout(() => {
        this.map.getContainer().classList.remove('zooming');
      }, 300);
    });

    // Gestion du déplacement
    this.map.on('movestart', () => {
      this.map.getContainer().classList.add('moving');
    });

    this.map.on('moveend', () => {
      setTimeout(() => {
        this.map.getContainer().classList.remove('moving');
      }, 200);
    });

    // Statistiques en temps réel
    this.map.on('zoomend moveend', () => {
      this.updateVisibleStats();
    });
  }

  /**
   * Charge les données des cinémas
   */
  async loadCinemaData() {
    try {
      this.showLoading(true);
      
      const response = await fetch('include/cinema.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.cinemaData = await response.json();
      
      if (!Array.isArray(this.cinemaData) || this.cinemaData.length === 0) {
        throw new Error('Aucune donnée de cinéma trouvée');
      }
      
      this.processData();
      this.createMarkers();
      this.populateDepartmentFilter();
      this.updateStats();
      
      console.log(`✅ ${this.cinemaData.length} cinémas chargés`);
      
      // Toast de succès
      if (window.UIManager) {
        setTimeout(() => {
          const uiManager = new UIManager();
          uiManager.showToast(`🎬 ${this.cinemaData.length} cinémas trouvés !`, 'success');
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      this.showError('Impossible de charger les données des cinémas');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Traite et valide les données
   */
  processData() {
    this.cinemaData = this.cinemaData.filter(cinema => {
      if (!cinema.geo || !cinema.nom) return false;
      
      const [latStr, lonStr] = cinema.geo.split(',');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      
      return !isNaN(lat) && !isNaN(lon) && 
             lat >= 48.0 && lat <= 49.5 && 
             lon >= 1.0 && lon <= 3.5;
    });
    
    console.log(`✅ ${this.cinemaData.length} cinémas valides après filtrage`);
  }

  /**
   * Crée les marqueurs sur la carte
   */
  createMarkers() {
    this.allMarkers = [];
    
    this.cinemaData.forEach((cinema, index) => {
      const [latStr, lonStr] = cinema.geo.split(',');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      
      if (isNaN(lat) || isNaN(lon)) return;

      // Création de l'icône personnalisée
      const customIcon = this.createCustomMarkerIcon(cinema);
      
      // Création du marqueur
      const marker = L.marker([lat, lon], { icon: customIcon });
      
      // Popup avec style néon
      const popupContent = this.createPopupContent(cinema);
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'neon-popup'
      });

      // Tooltip au hover
      marker.bindTooltip(cinema.nom, {
        permanent: false,
        direction: 'top',
        className: 'neon-tooltip'
      });

      // Stockage des métadonnées
      marker.cinemaData = cinema;
      marker.dep = cinema.dep?.toString() || '';
      
      this.allMarkers.push(marker);

      // Animation d'apparition décalée
      setTimeout(() => {
        this.markerCluster.addLayer(marker);
      }, index * 50);
    });
    
    console.log(`✅ ${this.allMarkers.length} marqueurs créés`);
  }

  /**
   * Crée une icône de marqueur personnalisée
   */
  createCustomMarkerIcon(cinema) {
    const iconHtml = `
      <div class="custom-marker">
        <div class="marker-glow"></div>
        <span class="marker-icon">🎬</span>
      </div>
    `;
    
    return L.divIcon({
      html: iconHtml,
      className: 'neon-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  }

  /**
   * Crée le contenu de la popup
   */
  createPopupContent(cinema) {
    const depCode = cinema.dep?.toString() || '';
    const depName = this.departmentNames[depCode] || 'Département inconnu';
    
    return `
      <div class="neon-popup-content">
        <h3 class="popup-title">${cinema.nom}</h3>
        <div class="popup-info">
          <p class="popup-address">
            📍 ${cinema.adresse || 'Adresse non disponible'}
          </p>
          <p class="popup-city">
            🏘️ ${cinema.commune || 'Ville inconnue'}
          </p>
          <p class="popup-department">
            🗺️ ${depName} (${depCode})
          </p>
        </div>
        <div class="popup-actions">
          <button class="btn btn--primary btn-small" onclick="openDirections('${cinema.geo}')">
            🧭 Itinéraire
          </button>
          <button class="btn btn--ghost btn-small" onclick="showCinemaDetails('${cinema.nom}')">
            ℹ️ Détails
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Applique un style de carte
   */
  applyMapStyle(style) {
    // Supprime toutes les couches
    if (this.map.hasLayer(this.osmLayer)) this.map.removeLayer(this.osmLayer);
    if (this.map.hasLayer(this.satelliteLayer)) this.map.removeLayer(this.satelliteLayer);
    if (this.map.hasLayer(this.darkLayer)) this.map.removeLayer(this.darkLayer);

    // Ajoute la nouvelle couche
    switch(style) {
      case 'satellite':
        this.satelliteLayer.addTo(this.map);
        break;
      case 'dark':
        this.darkLayer.addTo(this.map);
        break;
      default:
        this.osmLayer.addTo(this.map);
    }
    
    this.currentStyle = style;
    console.log(`✅ Style de carte changé: ${style}`);
  }

  /**
   * Filtre les marqueurs par département
   */
  filterByDepartment(selectedDep) {
    this.markerCluster.clearLayers();
    
    const markersToShow = this.allMarkers.filter(marker => {
      if (!selectedDep || selectedDep === 'all') return true;
      return marker.dep === selectedDep.toString();
    });
    
    // Animation d'ajout des marqueurs
    markersToShow.forEach((marker, index) => {
      setTimeout(() => {
        this.markerCluster.addLayer(marker);
      }, index * 30);
    });
    
    this.currentFilter = selectedDep;
    this.updateStats();
    
    console.log(`✅ Filtre appliqué: ${selectedDep} (${markersToShow.length} cinémas)`);
  }

  /**
   * Peuple le filtre des départements
   */
  populateDepartmentFilter() {
    if (!this.depSelect) return;
    
    const departments = new Set();
    this.cinemaData.forEach(cinema => {
      if (cinema.dep) {
        departments.add(cinema.dep.toString());
      }
    });
    
    const sortedDeps = Array.from(departments).sort();
    
    // Vider et repeupler
    this.depSelect.innerHTML = '<option value="all">🌍 Tous les départements</option>';
    
    sortedDeps.forEach(dep => {
      const option = document.createElement('option');
      option.value = dep;
      option.textContent = `${this.departmentNames[dep] || dep} (${dep})`;
      this.depSelect.appendChild(option);
    });
    
    console.log(`✅ ${sortedDeps.length} départements ajoutés au filtre`);
  }

  /**
   * Met à jour les statistiques
   */
  updateStats() {
    const visibleMarkers = this.getVisibleMarkers();
    const departments = new Set(visibleMarkers.map(m => m.dep)).size;
    
    // Mise à jour des compteurs avec animation
    this.animateStatCounter('.stat-item:nth-child(1) .stat-number', visibleMarkers.length);
    this.animateStatCounter('.stat-item:nth-child(2) .stat-number', departments);
    this.animateStatCounter('.stat-item:nth-child(3) .stat-number', visibleMarkers.length * 8); // Estimation
    this.animateStatCounter('.stat-item:nth-child(4) .stat-number', visibleMarkers.length * 15); // Estimation
  }

  /**
   * Anime un compteur de statistique
   */
  animateStatCounter(selector, targetValue) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(currentValue + (targetValue - currentValue) * this.easeOutExpo(progress));
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
   * Obtient les marqueurs visibles selon le filtre actuel
   */
  getVisibleMarkers() {
    if (this.currentFilter === 'all') {
      return this.allMarkers;
    }
    return this.allMarkers.filter(marker => marker.dep === this.currentFilter);
  }

  /**
   * Met à jour les stats des éléments visibles sur la carte
   */
  updateVisibleStats() {
    if (!this.map) return;
    
    const bounds = this.map.getBounds();
    const visibleMarkers = this.getVisibleMarkers().filter(marker => {
      const pos = marker.getLatLng();
      return bounds.contains(pos);
    });
    
    // Optionnel: afficher le nombre d'éléments visibles
    console.log(`👁️ ${visibleMarkers.length} cinémas visibles sur la carte`);
  }

  /**
   * Affiche/cache le loader
   */
  showLoading(show) {
    if (this.loadingElement) {
      this.loadingElement.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Affiche une erreur
   */
  showError(message) {
    console.error('❌', message);
    
    if (window.UIManager) {
      const uiManager = new UIManager();
      uiManager.showToast(message, 'error', 5000);
    }
    
    this.showLoading(false);
  }

  /**
   * Destruction propre
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.allMarkers = [];
    this.cinemaData = [];
  }
}

// Fonctions globales pour les popups
window.openDirections = (coords) => {
  const [lat, lon] = coords.split(',');
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  window.open(url, '_blank');
};

window.showCinemaDetails = (name) => {
  if (window.UIManager) {
    const uiManager = new UIManager();
    uiManager.showToast(`🎬 Détails de ${name} bientôt disponibles !`, 'info');
  }
};

// Styles CSS additionnels pour les marqueurs et popups
const mapStyles = document.createElement('style');
mapStyles.textContent = `
  .neon-marker {
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
  }
  
  .custom-marker {
    position: relative;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .marker-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: markerPulse 2s ease-in-out infinite;
  }
  
  .marker-icon {
    font-size: 16px;
    z-index: 1;
  }
  
  .neon-popup-content {
    font-family: var(--font-secondary);
  }
  
  .popup-title {
    font-family: var(--font-primary);
    color: transparent;
    background: linear-gradient(45deg, #00d4ff, #8b5cf6, #ec4899);
    background-clip: text;
    -webkit-background-clip: text;
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  .popup-info p {
    margin: 6px 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }
  
  .popup-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .leaflet-container.zooming {
    transition: all 0.3s ease;
  }
  
  .leaflet-container.moving {
    transition: all 0.2s ease;
  }
`;

document.head.appendChild(mapStyles);

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
  window.neonCinemaMap = new NeonCinemaMap();
});

console.log('🎬 NeonCinemaMap chargé et prêt!');
