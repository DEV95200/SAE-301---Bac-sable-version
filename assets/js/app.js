// Main Application JavaScript - CinéMap IDF
class CinemaApp {
    constructor() {
        this.cinemas = [];
        this.filteredCinemas = [];
        this.currentView = 'map';
        this.userLocation = null;
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        
        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load cinema data
        await this.loadCinemaData();
        
        // Initialize map
        this.initializeMap();
        
        // Initialize filters
        this.initializeFilters();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        console.log('CinéMap IDF initialized successfully!');
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('loading-screen').style.opacity = '1';
            }, 500);
        }, 1000);
    }

    async loadCinemaData() {
        try {
            const response = await fetch('./include/cinemas_data.json');
            const data = await response.json();
            this.cinemas = data.cinemas || [];
            this.filteredCinemas = [...this.cinemas];
            this.genres = data.genres || [];
            this.departements = data.departements || [];
            
            console.log(`Loaded ${this.cinemas.length} cinemas`);
            this.updateResultsCounter();
        } catch (error) {
            console.error('Error loading cinema data:', error);
            this.showError('Erreur lors du chargement des données des cinémas');
        }
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.id.replace('nav-', '');
                this.switchView(section);
            });
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Mobile navigation
        document.querySelectorAll('.mobile-nav-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent.trim();
                const section = text.includes('Carte') ? 'map' : 
                              text.includes('Liste') ? 'list' : 'stats';
                this.switchView(section);
                this.toggleMobileMenu();
            });
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Geolocation
        document.getElementById('geolocation-btn').addEventListener('click', () => {
            this.requestGeolocation();
        });

        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Modal close
        document.getElementById('cinema-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('cinema-modal')) {
                this.closeModal();
            }
        });

        // Filter changes
        document.getElementById('genre-filter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('departement-filter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('rating-filter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('services-filter').addEventListener('change', () => {
            this.applyFilters();
        });
    }

    switchView(view) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${view}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`nav-${view}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentView = view;

        // Handle view-specific initialization
        if (view === 'list') {
            this.renderCinemasList();
        } else if (view === 'stats') {
            this.renderStatistics();
        } else if (view === 'map' && this.map) {
            // Refresh map
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    }

    initializeFilters() {
        // Populate genre filter
        const genreFilter = document.getElementById('genre-filter');
        this.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });

        // Populate department filter
        const deptFilter = document.getElementById('departement-filter');
        this.departements.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.code;
            option.textContent = `${dept.code} - ${dept.nom}`;
            deptFilter.appendChild(option);
        });
    }

    applyFilters() {
        const genre = document.getElementById('genre-filter').value;
        const departement = document.getElementById('departement-filter').value;
        const rating = parseFloat(document.getElementById('rating-filter').value) || 0;
        const service = document.getElementById('services-filter').value;

        this.filteredCinemas = this.cinemas.filter(cinema => {
            // Genre filter
            if (genre !== 'all' && !cinema.types_films.includes(genre)) {
                return false;
            }

            // Department filter
            if (departement !== 'all' && cinema.departement !== departement) {
                return false;
            }

            // Rating filter
            if (rating > 0 && cinema.note < rating) {
                return false;
            }

            // Service filter
            if (service !== 'all') {
                if (service === 'parking' && !cinema.parking) {
                    return false;
                }
                if (service !== 'parking' && !cinema.services.includes(service)) {
                    return false;
                }
            }

            return true;
        });

        // Update displays
        this.updateResultsCounter();
        this.updateMapMarkers();
        
        if (this.currentView === 'list') {
            this.renderCinemasList();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredCinemas = [...this.cinemas];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredCinemas = this.cinemas.filter(cinema =>
                cinema.nom.toLowerCase().includes(searchTerm) ||
                cinema.ville.toLowerCase().includes(searchTerm) ||
                cinema.adresse.toLowerCase().includes(searchTerm) ||
                cinema.types_films.some(genre => genre.toLowerCase().includes(searchTerm))
            );
        }

        this.updateResultsCounter();
        this.updateMapMarkers();
        
        if (this.currentView === 'list') {
            this.renderCinemasList();
        }
    }

    clearAllFilters() {
        document.getElementById('genre-filter').value = 'all';
        document.getElementById('departement-filter').value = 'all';
        document.getElementById('rating-filter').value = '0';
        document.getElementById('services-filter').value = 'all';
        document.getElementById('search-input').value = '';

        this.filteredCinemas = [...this.cinemas];
        this.updateResultsCounter();
        this.updateMapMarkers();
        
        if (this.currentView === 'list') {
            this.renderCinemasList();
        }
    }

    updateResultsCounter() {
        const counter = document.getElementById('results-count');
        if (counter) {
            counter.textContent = this.filteredCinemas.length;
        }
    }

    requestGeolocation() {
        const btn = document.getElementById('geolocation-btn');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Localisation...';
        btn.disabled = true;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    this.showUserLocationOnMap();
                    this.findNearestCinemas();
                    
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    
                    this.showSuccess('Position obtenue avec succès !');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.showError('Impossible d\'obtenir votre position');
                    
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                }
            );
        } else {
            this.showError('La géolocalisation n\'est pas supportée par votre navigateur');
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    findNearestCinemas() {
        if (!this.userLocation) return;

        const cinemasWithDistance = this.cinemas.map(cinema => ({
            ...cinema,
            distance: this.calculateDistance(
                this.userLocation.lat, 
                this.userLocation.lng,
                cinema.latitude, 
                cinema.longitude
            )
        }));

        // Sort by distance
        cinemasWithDistance.sort((a, b) => a.distance - b.distance);

        // Show nearest cinemas (within 10km)
        const nearestCinemas = cinemasWithDistance.filter(cinema => cinema.distance <= 10);
        
        if (nearestCinemas.length > 0) {
            this.showNearestCinemasModal(nearestCinemas.slice(0, 5));
        } else {
            this.showInfo('Aucun cinéma trouvé dans un rayon de 10km');
        }
    }

    showNearestCinemasModal(cinemas) {
        const modalContent = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-cinema-accent">
                        <i class="fas fa-location-arrow mr-2"></i>Cinémas les plus proches
                    </h2>
                    <button onclick="cinemaApp.closeModal()" class="text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${cinemas.map(cinema => `
                        <div class="bg-cinema-light p-4 rounded-lg border border-cinema-medium hover:border-cinema-accent transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-semibold text-white">${cinema.nom}</h3>
                                <span class="text-cinema-accent font-medium">${cinema.distance.toFixed(1)} km</span>
                            </div>
                            <p class="text-gray-400 text-sm mb-2">
                                <i class="fas fa-map-marker-alt mr-1"></i>${cinema.adresse}
                            </p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="rating-stars mr-2">
                                        ${this.generateStars(cinema.note)}
                                    </div>
                                    <span class="text-sm text-gray-400">(${cinema.avis_count} avis)</span>
                                </div>
                                <button onclick="cinemaApp.showCinemaDetails(${cinema.id})" 
                                        class="bg-cinema-accent text-cinema-dark px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors">
                                    Voir détails
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('cinema-modal').classList.remove('hidden');
        document.getElementById('modal-content').parentElement.classList.add('modal-enter');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }

    closeModal() {
        const modal = document.getElementById('cinema-modal');
        const content = document.getElementById('modal-content').parentElement;
        
        content.classList.add('modal-exit');
        setTimeout(() => {
            modal.classList.add('hidden');
            content.classList.remove('modal-enter', 'modal-exit');
        }, 300);
    }

    showCinemaDetails(cinemaId) {
        const cinema = this.cinemas.find(c => c.id === cinemaId);
        if (!cinema) return;

        const modalContent = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-bold text-cinema-accent mb-2">${cinema.nom}</h2>
                        <p class="text-gray-400">
                            <i class="fas fa-map-marker-alt mr-2"></i>${cinema.adresse}
                        </p>
                    </div>
                    <button onclick="cinemaApp.closeModal()" class="text-gray-400 hover:text-white text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="bg-cinema-light p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-cinema-accent mb-3">Informations générales</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Note:</span>
                                    <div class="flex items-center">
                                        <div class="rating-stars mr-2">${this.generateStars(cinema.note)}</div>
                                        <span class="text-white">${cinema.note}/5 (${cinema.avis_count} avis)</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Salles:</span>
                                    <span class="text-white">${cinema.salles}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Prix moyen:</span>
                                    <span class="text-cinema-accent font-semibold">${cinema.prix_moyen.toFixed(2)}€</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Accessibilité:</span>
                                    <span class="${cinema.accessibilite ? 'text-green-400' : 'text-red-400'}">
                                        <i class="fas fa-${cinema.accessibilite ? 'check' : 'times'} mr-1"></i>
                                        ${cinema.accessibilite ? 'Accessible' : 'Non accessible'}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Parking:</span>
                                    <span class="${cinema.parking ? 'text-green-400' : 'text-red-400'}">
                                        <i class="fas fa-${cinema.parking ? 'check' : 'times'} mr-1"></i>
                                        ${cinema.parking ? 'Disponible' : 'Non disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-cinema-light p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-cinema-accent mb-3">Contact</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-center">
                                    <i class="fas fa-phone mr-3 text-cinema-accent w-4"></i>
                                    <span class="text-white">${cinema.telephone}</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-globe mr-3 text-cinema-accent w-4"></i>
                                    <a href="${cinema.site_web}" target="_blank" class="text-cinema-accent hover:underline">
                                        Site web
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-cinema-light p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-cinema-accent mb-3">Genres de films</h3>
                            <div class="flex flex-wrap gap-2">
                                ${cinema.types_films.map(genre => `
                                    <span class="genre-tag">${genre}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="bg-cinema-light p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-cinema-accent mb-3">Services</h3>
                            <div class="flex flex-wrap gap-2">
                                ${cinema.services.map(service => `
                                    <span class="bg-cinema-red bg-opacity-20 text-cinema-red px-3 py-1 rounded-full text-sm border border-cinema-red border-opacity-30">
                                        ${service}
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="bg-cinema-light p-4 rounded-lg">
                            <h3 class="text-lg font-semibold text-cinema-accent mb-3">Horaires</h3>
                            <div class="space-y-1 text-sm">
                                ${Object.entries(cinema.horaires).map(([jour, horaire]) => `
                                    <div class="flex justify-between">
                                        <span class="text-gray-400 capitalize">${jour}:</span>
                                        <span class="text-white">${horaire}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex justify-center">
                    <button onclick="cinemaApp.showOnMap(${cinema.id})" 
                            class="bg-cinema-accent text-cinema-dark px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                        <i class="fas fa-map-marked-alt mr-2"></i>Voir sur la carte
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('cinema-modal').classList.remove('hidden');
        document.getElementById('modal-content').parentElement.classList.add('modal-enter');
    }

    showOnMap(cinemaId) {
        const cinema = this.cinemas.find(c => c.id === cinemaId);
        if (!cinema) return;

        this.closeModal();
        this.switchView('map');
        
        setTimeout(() => {
            if (this.map) {
                this.map.setView([cinema.latitude, cinema.longitude], 16);
                
                // Find and open the marker popup
                this.markerClusterGroup.eachLayer(marker => {
                    if (marker.cinemaData && marker.cinemaData.id === cinemaId) {
                        marker.openPopup();
                    }
                });
            }
        }, 100);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const icons = {
            error: 'fas fa-exclamation-circle',
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle'
        };

        const colors = {
            error: 'bg-red-600 border-red-500',
            success: 'bg-green-600 border-green-500',
            info: 'bg-blue-600 border-blue-500'
        };

        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${icons[type]} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.className += ` ${colors[type]}`;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cinemaApp = new CinemaApp();
});