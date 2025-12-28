
// Initialiser la carte
var map = L.map('map').setView([48.8566, 2.3522], 10);

// Ajouter les tuiles OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Charger les données des cinémas
fetch('include/cinema.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(cinema => {
      if (cinema.lat && cinema.lng) {
        L.marker([cinema.lat, cinema.lng])
          .bindPopup(`<b>${cinema.nom}</b><br>${cinema.adresse}`)
          .addTo(map);
      }
    });
  })
  .catch(error => console.error('Erreur:', error));
