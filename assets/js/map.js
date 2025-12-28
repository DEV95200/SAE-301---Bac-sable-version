// Map functionality for CinéMap IDF
class MapManager {
    constructor(app) {
        this.app = app;
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        this.userMarker = null;
        this.mapStyles = {
            osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        };
        this.currentStyle = 'osm';
    }

    initialize() {
        // Initialize map centered on Île-de-France
        this.map = L.map('map', {
            zoomControl: false
        }).setView([48.8566, 2.3522], 10);

        // Add custom zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Set initial tile layer
        this.setMapStyle('osm');

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 80,
            iconCreateFunction: this.createClusterIcon
        });

        this.map.addLayer(this.markerClusterGroup);

        // Add map style selector event
        document.getElementById('map-style-select').addEventListener('change', (e) => {
            this.setMapStyle(e.target.value);
        });

        // Store reference in app
        this.app.map = this.map;
        this.app.markerClusterGroup = this.markerClusterGroup;

        console.log('Map initialized');
    }

    createClusterIcon(cluster) {
        const childCount = cluster.getChildCount();
        let c = ' marker-cluster-';

        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }

        return new L.DivIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40)
        });
    }

    setMapStyle(style) {
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        const tileUrl = this.mapStyles[style] || this.mapStyles.osm;
        
        this.currentTileLayer = L.tileLayer(tileUrl, {
            attribution: this.getAttribution(style),
            maxZoom: 18,
            id: `mapbox/${style}`
        });

        this.currentTileLayer.addTo(this.map);
        this.currentStyle = style;
    }

    getAttribution(style) {
        const attributions = {
            osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        };
        return attributions[style] || attributions.osm;
    }

    createCinemaIcon(cinema) {
        // Different icons based on cinema type or rating
        let iconClass = 'fa-film';
        let iconColor = '#d4af37';

        if (cinema.note >= 4.5) {
            iconColor = '#ffd700'; // Gold for excellent ratings
        } else if (cinema.note >= 4.0) {
            iconColor = '#d4af37'; // Cinema accent for good ratings
        } else if (cinema.note >= 3.5) {
            iconColor = '#ff8c00'; // Orange for average ratings
        } else {
            iconColor = '#ff6b6b'; // Red for poor ratings
        }

        // Special icons for special cinemas
        if (cinema.services.includes('IMAX')) {
            iconClass = 'fa-video';
        } else if (cinema.services.includes('4DX')) {
            iconClass = 'fa-cube';
        }

        return L.divIcon({
            className: 'custom-cinema-marker',
            html: `
                <div class="cinema-marker-container">
                    <div class="cinema-marker" style="background-color: ${iconColor}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    }

    createPopupContent(cinema) {
        return `
            <div class="cinema-popup">
                <div class="cinema-popup-header">${cinema.nom}</div>
                <div class="cinema-popup-info">
                    <div class="mb-2">
                        <i class="fas fa-map-marker-alt mr-2"></i>${cinema.ville}
                    </div>
                    <div class="mb-2">
                        <i class="fas fa-film mr-2"></i>${cinema.salles} salle${cinema.salles > 1 ? 's' : ''}
                    </div>
                    <div class="cinema-popup-rating mb-3">
                        <div class="flex items-center">
                            <div class="rating-stars mr-2">
                                ${this.app.generateStars(cinema.note)}
                            </div>
                            <span>${cinema.note}/5 (${cinema.avis_count} avis)</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong class="text-cinema-accent">${cinema.prix_moyen.toFixed(2)}€</strong> prix moyen
                    </div>
                    <div class="mb-3">
                        ${cinema.types_films.slice(0, 3).map(genre => 
                            `<span class="genre-tag mr-1">${genre}</span>`
                        ).join('')}
                        ${cinema.types_films.length > 3 ? `<span class="text-cinema-accent">+${cinema.types_films.length - 3}</span>` : ''}
                    </div>
                    <div class="text-center mt-3">
                        <button onclick="cinemaApp.showCinemaDetails(${cinema.id})" 
                                class="bg-cinema-accent text-cinema-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors">
                            <i class="fas fa-info-circle mr-1"></i>Voir détails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateMarkers(cinemas) {
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers = [];

        if (!cinemas || cinemas.length === 0) {
            return;
        }

        // Add markers for filtered cinemas
        cinemas.forEach(cinema => {
            const marker = L.marker([cinema.latitude, cinema.longitude], {
                icon: this.createCinemaIcon(cinema)
            });

            marker.cinemaData = cinema;

            const popupContent = this.createPopupContent(cinema);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            // Add click animation
            marker.on('click', function(e) {
                this.bounce();
            });

            this.markers.push(marker);
            this.markerClusterGroup.addLayer(marker);
        });

        // Fit map to markers if there are any
        if (this.markers.length > 0 && cinemas.length < 50) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    showUserLocation(location) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        this.userMarker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: `
                    <div class="user-marker">
                        <div class="user-marker-inner">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-marker-pulse"></div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(this.map);

        this.userMarker.bindPopup(`
            <div class="text-center">
                <div class="text-cinema-accent font-semibold mb-2">
                    <i class="fas fa-map-marker-alt mr-2"></i>Votre position
                </div>
                <p class="text-sm text-gray-300">
                    Coordonnées: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                </p>
            </div>
        `);

        // Center map on user location
        this.map.setView([location.lat, location.lng], 12);
    }

    // Method to handle map resize
    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    // Method to add custom CSS for markers
    addCustomMarkerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-cinema-marker {
                background: transparent !important;
                border: none !important;
            }

            .cinema-marker-container {
                position: relative;
                width: 30px;
                height: 30px;
            }

            .cinema-marker {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1a1a1a;
                font-size: 12px;
                font-weight: bold;
                border: 2px solid #1a1a1a;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.3s ease;
                position: relative;
                z-index: 1000;
            }

            .cinema-marker:hover {
                transform: scale(1.2);
            }

            .user-location-marker {
                background: transparent !important;
                border: none !important;
            }

            .user-marker {
                position: relative;
                width: 40px;
                height: 40px;
            }

            .user-marker-inner {
                width: 20px;
                height: 20px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                z-index: 1001;
            }

            .user-marker-pulse {
                width: 40px;
                height: 40px;
                background: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                position: absolute;
                top: 0;
                left: 0;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% {
                    transform: scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            .leaflet-popup-content-wrapper {
                background: #1a1a1a !important;
                border: 1px solid #d4af37 !important;
                color: white !important;
                border-radius: 8px !important;
            }

            .leaflet-popup-tip {
                background: #1a1a1a !important;
                border: 1px solid #d4af37 !important;
            }

            .custom-popup .leaflet-popup-content {
                margin: 12px;
            }

            .bounce {
                animation: bounce 0.6s ease-in-out;
            }

            @keyframes bounce {
                0%, 20%, 60%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                80% {
                    transform: translateY(-5px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Extend the CinemaApp with map functionality
Object.assign(CinemaApp.prototype, {
    initializeMap() {
        this.mapManager = new MapManager(this);
        this.mapManager.addCustomMarkerStyles();
        this.mapManager.initialize();
        this.updateMapMarkers();
    },

    updateMapMarkers() {
        if (this.mapManager) {
            this.mapManager.updateMarkers(this.filteredCinemas);
        }
    },

    showUserLocationOnMap() {
        if (this.mapManager && this.userLocation) {
            this.mapManager.showUserLocation(this.userLocation);
        }
    }
});