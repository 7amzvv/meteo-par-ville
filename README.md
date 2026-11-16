# Météo par ville

Une page simple pour consulter la météo actuelle d’une ville. Le bulletin affiche la température, l’humidité, la vitesse du vent et un pictogramme pour les conditions météo. Le bouton **Mode sombre** permet de passer d’un thème à l’autre.

## Lancer le projet

1. Téléchargez ou clonez le dépôt.
2. Ouvrez `index.html` dans un navigateur avec une connexion Internet.
3. Saisissez une ville, cliquez sur **Rechercher**, puis choisissez un résultat. La région et le pays aident à distinguer les villes du même nom.

Le projet utilise HTML, CSS et JavaScript. Aucun paquet ni clé API à installer.

## Comment ça marche

La recherche envoie le nom de la ville au service de géocodage. Quand vous choisissez un résultat, la page envoie sa latitude et sa longitude au service météo. Le bulletin affiche les mesures et leurs unités à partir de la réponse. [Géocodage Open-Meteo](https://open-meteo.com/en/docs/geocoding-api) · [API météo Open-Meteo](https://open-meteo.com/en/docs)

Les données météo sont fournies par [Open-Meteo](https://open-meteo.com/) et les données de recherche de villes proviennent de [GeoNames](https://www.geonames.org/).

## Essayer la page

- Rechercher **Caen** et ouvrir son bulletin.
- Rechercher **Évreux** avec son accent.
- Rechercher **Paris** et vérifier la région et le pays avant de choisir.
- Couper la connexion avant de lancer une recherche pour vérifier que la page affiche un message d’erreur.
