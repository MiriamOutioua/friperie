# Friperie
Le projet friperie est un site e-commerce d'une friperie imaginaire, celui-ci à été réalisé durant ma dernière année de licence informatique.
Il donne la possibilité de visualiser les produits de cette friperie imaginaire, les ajouter à un panier et passer une commande. 
Toutes ces actions seront visibles du côté gérant du site dans lequel les stocks disponibles sont détaillés, les commandes qui ont été passée sont également stockées côté gérant et ce dernier peut également ajouter du stock sur les produits qu'il souhaite.

### Initialiser le projet
Dans un premier il sera nécessaire d'initialiser la base de données, pour cela un fichier SQL est fourni dans lequel des données sont déjà répertoriées.
###### Placer vous dans le dossier src et taper la commande `psql`
###### Après ceci taper les requêtes suivantes : 
`DROP DATABASE IF EXISTS friperie;`
`CREATE DATABASE friperie;`
`exit`
###### Connectez vous ensuite à psql de la manière suivante : `psql -U nom_utilisateur -W postgres` 
###### Connectez vous enfin à la base de données : `\c friperie` et exécuter le fichier init `\i init.sql`

### Lancer le site
Pour lancer le site il vous faudra vous placer dans le dossier `src/script` et dans un premier temps s'assurer que les modules nécéssaires sont installés, vous aurez besoin des trois modules suivants :

	- postgres `pg`
	- EJS `ejs`
	- Express `express`

Vous pourrez les installer à l'aide de la commande `npm install` suivi du module souhaité.
Ensuite vous pourrez lancer la commande `node main.js`.
Après cela le serveur et lancé et il ne reste plus qu'à aller sur votre navigateur à l'adresse 	`http://localhost:8080/`	