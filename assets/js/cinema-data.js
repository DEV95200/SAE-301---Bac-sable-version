/**
 * ===============================
 *    GESTIONNAIRE DE DONNÉES CINÉMA
 * ===============================
 */

class CinemaDataManager {
  constructor() {
    this.cinemas = [];
    this.departments = {};
    this.movieGenres = [
      'Action', 'Aventure', 'Comédie', 'Drame', 'Horreur', 
      'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentaire'
    ];
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    try {
      await this.loadCinemaData();
      this.processData();
      this.createDataVisualization();
      this.setupInteractions();
      this.startDataStream();
    } catch (error) {
      console.error('❌ Erreur initialisation CinemaDataManager:', error);
    }
  }

  /**
   * Charge les données des cinémas
   */
  async loadCinemaData() {
    const response = await fetch('include/cinema.json');
    this.cinemas = await response.json();
    
    // Enrichir les données avec des infos fictives pour la démonstration
    this.cinemas = this.cinemas.map(cinema => ({
      ...cinema,
      salles: Math.floor(Math.random() * 15) + 3, // 3-18 salles
      capacite: Math.floor(Math.random() * 2000) + 500, // 500-2500 places
      genres: this.getRandomGenres(),
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
      screenings: Math.floor(Math.random() * 50) + 10, // 10-60 séances/jour
      technologies: this.getRandomTechnologies()
    }));
    
    console.log(`✅ ${this.cinemas.length} cinémas chargés et enrichis`);
  }

  /**
   * Génère des genres aléatoires pour chaque cinéma
   */
  getRandomGenres() {
    const count = Math.floor(Math.random() * 4) + 3; // 3-6 genres
    const shuffled = [...this.movieGenres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Génère des technologies aléatoires
   */
  getRandomTechnologies() {
    const techs = ['IMAX', '4DX', 'Dolby Atmos', '3D', 'VIP', 'ScreenX'];
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...techs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Traite les données pour créer des statistiques
   */
  processData() {
    // Grouper par département
    this.departments = {};
    this.cinemas.forEach(cinema => {
      const dep = cinema.dep || 'Unknown';
      if (!this.departments[dep]) {
        this.departments[dep] = [];
      }
      this.departments[dep].push(cinema);
    });

    console.log('✅ Données traitées par département');
  }

  /**
   * Crée la visualisation des données
   */
  createDataVisualization() {
    this.createStatsBoxes();
    this.createDepartmentChart();
    this.createGenreFilter();
    this.createCinemaList();
    this.createTechnologyStats();
  }

  /**
   * Crée les boîtes statistiques
   */
  createStatsBoxes() {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'cinema-stats';
    
    const totalCinemas = this.cinemas.length;
    const totalDepts = Object.keys(this.departments).length;
    const totalScreenings = this.cinemas.reduce((sum, c) => sum + c.screenings, 0);
    const avgRating = (this.cinemas.reduce((sum, c) => sum + parseFloat(c.rating), 0) / totalCinemas).toFixed(1);
    
    const stats = [
      { value: totalCinemas, label: 'Cinémas' },
      { value: totalDepts, label: 'Départements' },
      { value: totalScreenings, label: 'Séances/jour' },
      { value: avgRating + '⭐', label: 'Note moyenne' }
    ];

    stats.forEach(stat => {
      const box = document.createElement('div');
      box.className = 'stat-box';
      box.innerHTML = `
        <span class="stat-value">${stat.value}</span>
        <span class="stat-label">${stat.label}</span>
      `;
      statsContainer.appendChild(box);
    });

    this.insertIntoSidebar(statsContainer, 'Statistiques Globales');
  }

  /**
   * Crée un graphique des départements
   */
  createDepartmentChart() {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    const title = document.createElement('h3');
    title.className = 'chart-title';
    title.textContent = '📊 Cinémas par Département';
    
    const barChart = document.createElement('div');
    barChart.className = 'bar-chart';
    
    const maxCount = Math.max(...Object.values(this.departments).map(d => d.length));
    
    Object.entries(this.departments).forEach(([dep, cinemas]) => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      const height = (cinemas.length / maxCount) * 160; // Max 160px
      bar.style.height = `${height}px`;
      
      const label = document.createElement('div');
      label.className = 'bar-label';
      label.textContent = dep;
      
      const value = document.createElement('div');
      value.className = 'bar-value';
      value.textContent = cinemas.length;
      
      bar.appendChild(label);
      bar.appendChild(value);
      barChart.appendChild(bar);
    });
    
    chartContainer.appendChild(title);
    chartContainer.appendChild(barChart);
    
    this.insertIntoSidebar(chartContainer);
  }

  /**
   * Crée le filtre par genre
   */
  createGenreFilter() {
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    
    const title = document.createElement('h3');
    title.className = 'filter-title';
    title.textContent = '🎭 Filtrer par Genre';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'filter-buttons';
    
    // Bouton "Tous"
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'Tous';
    allBtn.addEventListener('click', () => {
      this.filterByGenre('all');
      this.updateActiveButton(allBtn);
    });
    buttonContainer.appendChild(allBtn);
    
    // Boutons pour chaque genre
    this.movieGenres.forEach(genre => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = genre;
      btn.addEventListener('click', () => {
        this.filterByGenre(genre);
        this.updateActiveButton(btn);
      });
      buttonContainer.appendChild(btn);
    });
    
    filterGroup.appendChild(title);
    filterGroup.appendChild(buttonContainer);
    
    this.insertIntoSidebar(filterGroup);
  }

  /**
   * Crée la liste des cinémas
   */
  createCinemaList() {
    const listContainer = document.createElement('div');
    listContainer.className = 'cinema-list';
    listContainer.id = 'cinema-list';
    
    this.updateCinemaList(this.cinemas);
    this.insertIntoSidebar(listContainer, '🎬 Liste des Cinémas');
  }

  /**
   * Met à jour la liste des cinémas
   */
  updateCinemaList(cinemas) {
    const container = document.getElementById('cinema-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    cinemas.forEach(cinema => {
      const item = document.createElement('div');
      item.className = 'cinema-item';
      item.innerHTML = `
        <div class="cinema-icon">🎬</div>
        <div class="cinema-info">
          <h4>${cinema.nom}</h4>
          <p>${cinema.commune} (${cinema.dep}) • ${cinema.salles} salles</p>
          <p>Note: ${cinema.rating}⭐ • ${cinema.screenings} séances/jour</p>
        </div>
      `;
      
      // Clic pour centrer sur la carte
      item.addEventListener('click', () => {
        this.centerOnCinema(cinema);
      });
      
      container.appendChild(item);
    });
  }

  /**
   * Statistiques des technologies
   */
  createTechnologyStats() {
    const techStats = {};
    this.cinemas.forEach(cinema => {
      cinema.technologies.forEach(tech => {
        techStats[tech] = (techStats[tech] || 0) + 1;
      });
    });
    
    const container = document.createElement('div');
    container.className = 'filter-group';
    
    const title = document.createElement('h3');
    title.className = 'filter-title';
    title.textContent = '🔧 Technologies Disponibles';
    
    const techList = document.createElement('div');
    Object.entries(techStats).forEach(([tech, count]) => {
      const badge = document.createElement('span');
      badge.className = 'badge badge--cinema';
      badge.textContent = `${tech} (${count})`;
      badge.style.margin = '2px';
      techList.appendChild(badge);
    });
    
    container.appendChild(title);
    container.appendChild(techList);
    
    this.insertIntoSidebar(container);
  }

  /**
   * Filtre par genre de film
   */
  filterByGenre(genre) {
    let filteredCinemas;
    
    if (genre === 'all') {
      filteredCinemas = this.cinemas;
    } else {
      filteredCinemas = this.cinemas.filter(cinema => 
        cinema.genres.includes(genre)
      );
    }
    
    this.updateCinemaList(filteredCinemas);
    this.currentFilter = genre;
    
    // Mettre à jour la carte si elle existe
    if (window.neonCinemaMap) {
      window.neonCinemaMap.filterCinemas(filteredCinemas);
    }
    
    console.log(`🎭 Filtre appliqué: ${genre} (${filteredCinemas.length} cinémas)`);
  }

  /**
   * Centre la carte sur un cinéma
   */
  centerOnCinema(cinema) {
    if (window.neonCinemaMap && cinema.geo) {
      const [lat, lon] = cinema.geo.split(',').map(parseFloat);
      window.neonCinemaMap.map.setView([lat, lon], 15);
      
      // Notification
      if (window.UIManager) {
        const ui = new UIManager();
        ui.showToast(`🎯 Centrage sur ${cinema.nom}`, 'success');
      }
    }
  }

  /**
   * Met à jour le bouton actif
   */
  updateActiveButton(activeBtn) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  /**
   * Insère un élément dans la sidebar
   */
  insertIntoSidebar(element, title = null) {
    const sidebar = document.querySelector('.sidebar__content');
    if (!sidebar) return;
    
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'control-group';
      titleElement.innerHTML = `<h3 class="control-group__title">${title}</h3>`;
      titleElement.appendChild(element);
      sidebar.appendChild(titleElement);
    } else {
      sidebar.appendChild(element);
    }
  }

  /**
   * Démarre le flux de données en temps réel (simulation)
   */
  startDataStream() {
    const dataStream = document.createElement('div');
    dataStream.className = 'data-stream';
    dataStream.id = 'data-stream';
    
    this.insertIntoSidebar(dataStream, '📡 Flux de Données');
    
    // Simulation de données en temps réel
    setInterval(() => {
      this.addDataLine();
    }, 3000);
  }

  /**
   * Ajoute une ligne de données au flux
   */
  addDataLine() {
    const stream = document.getElementById('data-stream');
    if (!stream) return;
    
    const randomCinema = this.cinemas[Math.floor(Math.random() * this.cinemas.length)];
    const timestamp = new Date().toLocaleTimeString();
    const data = [
      `[${timestamp}] Nouveau film à ${randomCinema.nom}`,
      `[${timestamp}] Réservation: ${randomCinema.commune} - ${Math.floor(Math.random() * 20) + 1} places`,
      `[${timestamp}] Taux occupation: ${Math.floor(Math.random() * 100)}% à ${randomCinema.nom}`,
      `[${timestamp}] Nouveau avis ⭐${(Math.random() * 2 + 3).toFixed(1)} pour ${randomCinema.nom}`
    ];
    
    const randomData = data[Math.floor(Math.random() * data.length)];
    
    const line = document.createElement('div');
    line.className = 'data-line';
    line.textContent = randomData;
    
    stream.appendChild(line);
    
    // Garder seulement les 10 dernières lignes
    while (stream.children.length > 10) {
      stream.removeChild(stream.firstChild);
    }
    
    // Scroll automatique vers le bas
    stream.scrollTop = stream.scrollHeight;
  }

  /**
   * Configuration des interactions
   */
  setupInteractions() {
    // Animation des stats au hover
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.stat-box')) {
        e.target.closest('.stat-box').style.transform = 'scale(1.05) rotateY(5deg)';
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.stat-box')) {
        e.target.closest('.stat-box').style.transform = '';
      }
    });
  }

  /**
   * Obtient les statistiques actuelles
   */
  getStats() {
    return {
      totalCinemas: this.cinemas.length,
      departments: Object.keys(this.departments).length,
      avgRating: (this.cinemas.reduce((sum, c) => sum + parseFloat(c.rating), 0) / this.cinemas.length).toFixed(1),
      totalScreenings: this.cinemas.reduce((sum, c) => sum + c.screenings, 0),
      topGenres: this.getTopGenres()
    };
  }

  /**
   * Obtient les genres les plus populaires
   */
  getTopGenres() {
    const genreCount = {};
    this.cinemas.forEach(cinema => {
      cinema.genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });
    
    return Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
  }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
  // Attendre que la sidebar soit créée
  setTimeout(() => {
    window.cinemaDataManager = new CinemaDataManager();
  }, 1000);
});

console.log('📊 CinemaDataManager chargé et prêt!');