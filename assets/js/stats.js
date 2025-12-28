// Statistics functionality for CinéMap IDF
Object.assign(CinemaApp.prototype, {
    renderStatistics() {
        this.renderStatsCards();
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    },

    renderStatsCards() {
        const statsContainer = document.querySelector('#stats-section .grid:first-child');
        if (!statsContainer) return;

        const stats = this.calculateBasicStats();

        const statsCards = [
            {
                title: 'Total Cinémas',
                value: stats.totalCinemas,
                icon: 'fas fa-film',
                color: 'text-cinema-accent',
                description: 'cinémas en Île-de-France'
            },
            {
                title: 'Note Moyenne',
                value: stats.averageRating.toFixed(1),
                icon: 'fas fa-star',
                color: 'text-yellow-400',
                description: 'étoiles en moyenne'
            },
            {
                title: 'Prix Moyen',
                value: `${stats.averagePrice.toFixed(2)}€`,
                icon: 'fas fa-euro-sign',
                color: 'text-green-400',
                description: 'prix d\'entrée moyen'
            },
            {
                title: 'Total Salles',
                value: stats.totalScreens,
                icon: 'fas fa-tv',
                color: 'text-blue-400',
                description: 'salles de cinéma'
            }
        ];

        statsContainer.innerHTML = statsCards.map(stat => `
            <div class="stat-card rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-cinema-light rounded-full mb-4">
                    <i class="${stat.icon} text-2xl ${stat.color}"></i>
                </div>
                <div class="stat-number">${stat.value}</div>
                <h3 class="text-lg font-semibold text-white mb-1">${stat.title}</h3>
                <p class="text-sm text-gray-400">${stat.description}</p>
            </div>
        `).join('');
    },

    calculateBasicStats() {
        if (this.cinemas.length === 0) {
            return {
                totalCinemas: 0,
                averageRating: 0,
                averagePrice: 0,
                totalScreens: 0
            };
        }

        return {
            totalCinemas: this.cinemas.length,
            averageRating: this.cinemas.reduce((sum, cinema) => sum + cinema.note, 0) / this.cinemas.length,
            averagePrice: this.cinemas.reduce((sum, cinema) => sum + cinema.prix_moyen, 0) / this.cinemas.length,
            totalScreens: this.cinemas.reduce((sum, cinema) => sum + cinema.salles, 0)
        };
    },

    renderCharts() {
        this.renderDepartmentChart();
        this.renderGenresChart();
    },

    renderDepartmentChart() {
        const ctx = document.getElementById('department-chart');
        if (!ctx) return;

        // Calculate department distribution
        const deptData = {};
        this.cinemas.forEach(cinema => {
            const deptName = this.departements.find(d => d.code === cinema.departement)?.nom || cinema.departement;
            deptData[deptName] = (deptData[deptName] || 0) + 1;
        });

        const labels = Object.keys(deptData);
        const data = Object.values(deptData);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#d4af37',
                        '#e50914',
                        '#0f3460',
                        '#ff8c00',
                        '#32cd32',
                        '#ff69b4',
                        '#8a2be2',
                        '#00ced1'
                    ],
                    borderColor: '#1a1a1a',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#d4af37',
                        bodyColor: '#ffffff',
                        borderColor: '#d4af37',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const percentage = ((context.parsed / this.cinemas.length) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} cinémas (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    },

    renderGenresChart() {
        const ctx = document.getElementById('genres-chart');
        if (!ctx) return;

        // Calculate genre popularity
        const genreData = {};
        this.cinemas.forEach(cinema => {
            cinema.types_films.forEach(genre => {
                genreData[genre] = (genreData[genre] || 0) + 1;
            });
        });

        // Sort genres by popularity and take top 10
        const sortedGenres = Object.entries(genreData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedGenres.map(([genre]) => genre);
        const data = sortedGenres.map(([, count]) => count);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre de cinémas',
                    data: data,
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderColor: '#d4af37',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(212, 175, 55, 1)',
                    hoverBorderColor: '#b8941f'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#d4af37',
                        bodyColor: '#ffffff',
                        borderColor: '#d4af37',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const percentage = ((context.parsed.y / this.cinemas.length) * 100).toFixed(1);
                                return `${context.parsed.y} cinémas (${percentage}% du total)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 11
                            },
                            maxRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 11
                            },
                            beginAtZero: true,
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },

    // Additional statistics methods
    getTopRatedCinemas(limit = 5) {
        return [...this.cinemas]
            .sort((a, b) => b.note - a.note)
            .slice(0, limit);
    },

    getCinemasByPriceRange() {
        const ranges = {
            'Économique (< 10€)': 0,
            'Moyen (10-13€)': 0,
            'Premium (> 13€)': 0
        };

        this.cinemas.forEach(cinema => {
            if (cinema.prix_moyen < 10) {
                ranges['Économique (< 10€)']++;
            } else if (cinema.prix_moyen <= 13) {
                ranges['Moyen (10-13€)']++;
            } else {
                ranges['Premium (> 13€)']++;
            }
        });

        return ranges;
    },

    getServicePopularity() {
        const services = {};
        this.cinemas.forEach(cinema => {
            cinema.services.forEach(service => {
                services[service] = (services[service] || 0) + 1;
            });
        });

        return Object.entries(services)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [service, count]) => {
                obj[service] = count;
                return obj;
            }, {});
    },

    getAccessibilityStats() {
        const accessible = this.cinemas.filter(c => c.accessibilite).length;
        const withParking = this.cinemas.filter(c => c.parking).length;

        return {
            accessible: {
                count: accessible,
                percentage: ((accessible / this.cinemas.length) * 100).toFixed(1)
            },
            parking: {
                count: withParking,
                percentage: ((withParking / this.cinemas.length) * 100).toFixed(1)
            }
        };
    }
});