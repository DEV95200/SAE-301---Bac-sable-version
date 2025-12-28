# 🎬 NeonCinéma IDF - Carte Interactive des Cinémas

## 📖 Description

NeonCinéma IDF est une application web interactive qui affiche les cinémas d'Île-de-France sur une carte avec un design futuriste néon. Développée dans le cadre de la SAE 301, cette application combine la visualisation de données géographiques avec une interface utilisateur moderne et immersive.

## ✨ Caractéristiques

### 🎨 Design
- **Thème néon futuriste** avec dégradés bleu-noir
- **Animations CSS** fluides et modernes
- **Interface responsive** pour tous les appareils
- **Effets de parallax** et animations au scroll
- **Glass morphism** et effets de transparence

### 🗺️ Fonctionnalités Cartographiques
- **Carte interactive** avec Leaflet.js
- **Clustering intelligent** des marqueurs
- **Filtrage par département**
- **Styles de carte multiples** (Classique, Satellite)
- **Popups informatifs** avec détails des cinémas
- **Tooltips personnalisés**

### 🚀 Interactions
- **Sidebar rétractable** avec contrôles
- **Menu mobile responsive**
- **Raccourcis clavier**
- **Notifications toast**
- **Statistiques en temps réel**

## 🏗️ Architecture du Projet

```
SAE-301---Bac-sable-version/
├── assets/
│   ├── css/
│   │   ├── main.css           # Fichier CSS principal
│   │   ├── variables.css      # Variables CSS globales
│   │   ├── base.css          # Styles de base
│   │   ├── animations.css     # Animations et transitions
│   │   ├── components.css     # Composants réutilisables
│   │   ├── header.css        # Styles de l'en-tête
│   │   ├── sidebar.css       # Styles de la sidebar
│   │   ├── map.css           # Styles spécifiques à la carte
│   │   └── responsive.css    # Media queries
│   ├── js/
│   │   ├── animations.js     # Gestionnaire d'animations
│   │   └── ui.js            # Gestionnaire d'interface
│   └── icons/
│       ├── cinema.svg       # Icône de cinéma
│       └── favicon.svg      # Favicon du site
├── include/
│   ├── cinema.json          # Données des cinémas
│   ├── leaflet.js          # Gestionnaire de carte principal
│   └── styles.css          # Ancien fichier de styles
├── index.html              # Page principale
└── README.md              # Documentation
```

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Bleu sombre primaire** : `#0a0e1a`
- **Bleu profond** : `#1e3a8a`
- **Gris sombre secondaire** : `#1a1f2e`

### Couleurs d'accent néon
- **Cyan néon** : `#00d4ff`
- **Violet néon** : `#8b5cf6`
- **Rose néon** : `#ec4899`

### Dégradés
- **Primaire** : `linear-gradient(135deg, #0a0e1a 0%, #1e3a8a 50%, #1a1f2e 100%)`
- **Néon** : `linear-gradient(45deg, #00d4ff, #8b5cf6, #ec4899)`
- **Boutons** : `linear-gradient(45deg, #00d4ff 0%, #8b5cf6 50%, #ec4899 100%)`

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Styles avancés avec variables CSS, Grid, Flexbox
- **JavaScript ES6+** - Logique d'application moderne
- **Leaflet.js** - Cartographie interactive
- **MarkerCluster** - Regroupement de marqueurs

### Polices
- **Orbitron** - Police futuriste pour les titres
- **Rajdhani** - Police moderne pour le contenu

### APIs Externes
- **OpenStreetMap** - Données cartographiques
- **Esri Satellite** - Imagerie satellite
- **CartoDB** - Tuiles sombres

## 🚀 Installation et Utilisation

### Prérequis
- Serveur web local (XAMPP, WAMP, Live Server, etc.)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation
1. Clonez ou téléchargez le projet
2. Placez le dossier dans votre serveur web
3. Ouvrez `index.html` dans votre navigateur
4. Profitez de l'expérience !

### Raccourcis Clavier
- **Ctrl + B** : Ouvrir/Fermer la sidebar
- **Ctrl + K** : Focus sur la recherche
- **Escape** : Fermer les modales/sidebar
- **?** ou **Ctrl + H** : Aide des raccourcis

## 📱 Responsive Design

L'application s'adapte automatiquement à tous les types d'appareils :

- **Desktop** (> 1024px) : Interface complète avec sidebar
- **Tablet** (768px - 1024px) : Interface adaptée
- **Mobile** (< 768px) : Interface simplifiée et tactile

## ⚡ Fonctionnalités Avancées

### Animations
- **Intersection Observer** pour les animations au scroll
- **Morphing des éléments** au hover
- **Particules animées** en arrière-plan
- **Transitions fluides** entre les états

### Performance
- **Lazy loading** des images
- **Debouncing** des événements
- **Optimisation des animations** avec requestAnimationFrame
- **Gestion mémoire** appropriée

### Accessibilité
- **Contraste élevé** respecté
- **Navigation clavier** complète
- **ARIA labels** appropriés
- **Textes alternatifs** pour les images
- **Réduction de mouvement** respectée

## 🎯 Utilisation des Classes CSS

### Classes d'animation
- `.animate-float` : Animation de flottement
- `.animate-neon` : Effet néon pulsant
- `.animate-gradient` : Dégradé animé
- `.hover-glow` : Lueur au survol

### Classes utilitaires
- `.btn--primary` : Bouton principal avec dégradé
- `.card` : Carte avec effet glass
- `.glass` : Effet de morphisme de verre
- `.neon-text` : Texte avec dégradé néon

## 🔧 Personnalisation

### Modifier les couleurs
Éditez le fichier `assets/css/variables.css` pour changer la palette de couleurs.

### Ajouter des animations
Utilisez `assets/css/animations.css` pour créer de nouvelles animations.

### Modifier les données
Éditez `include/cinema.json` pour ajouter/modifier les cinémas.

## 🐛 Dépannage

### La carte ne se charge pas
- Vérifiez la connexion internet
- Assurez-vous que le fichier `cinema.json` n'est pas vide
- Ouvrez la console développeur pour voir les erreurs

### Les animations ne fonctionnent pas
- Vérifiez que tous les fichiers CSS sont bien liés
- Assurez-vous que JavaScript est activé
- Testez sur un navigateur moderne

### Problèmes de responsive
- Videz le cache du navigateur
- Testez en mode privé
- Vérifiez les media queries

## 📊 Données

Le fichier `cinema.json` contient actuellement 20 cinémas fictifs répartis dans 8 départements d'Île-de-France. Chaque cinéma comprend :

- **nom** : Nom du cinéma
- **adresse** : Adresse complète
- **commune** : Ville
- **dep** : Code département
- **geo** : Coordonnées GPS (latitude,longitude)

## 🎯 Objectifs Pédagogiques (SAE 301)

Ce projet répond aux objectifs de la SAE 301 :

1. **Intégration de données** géographiques
2. **Développement web** moderne
3. **Design UX/UI** avancé
4. **Optimisation** et performance
5. **Responsive design**
6. **Accessibilité** web

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est développé dans un cadre éducatif pour la SAE 301.

## 🙏 Crédits

- **Leaflet.js** pour la cartographie
- **OpenStreetMap** pour les données cartographiques
- **Google Fonts** pour les polices Orbitron et Rajdhani
- **Unsplash** pour les inspirations design

---

**Développé avec ❤️ pour la SAE 301** - Découverte des cinémas d'Île-de-France dans un univers néon futuriste !
