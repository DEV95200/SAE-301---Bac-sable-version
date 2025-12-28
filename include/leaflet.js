
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
});
