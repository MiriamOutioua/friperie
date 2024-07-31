const express = require('express');
const friperie = require('./Friperie_db');
const server = express();
const port = 8080;

server.set('view engine', 'ejs');
server.use(express.static(__dirname));
server.use(express.urlencoded({extended: true}));

let pantalon, chemise, veste, autre, type_combinaison;
let nb_de_combi, nb_de_produit;
let tailles_pour_produit = [];

// connecte à la base de données et rempli les variables globales à partir de celle-ci
async function run() {
	await friperie.connect();
	pantalon = await friperie.get_categorie('pantalon');
	chemise = await friperie.get_categorie('chemise');
	veste = await friperie.get_categorie('veste');
	autre = await friperie.get_categorie('autre');
	type_combinaison = await friperie.get_categorie('type_combinaison');
	nb_de_produit = await friperie.get_categorie('cardinal');
	nb_de_combi = await friperie.get_categorie('cardinal_combi');
}

// mets à jour les variables globales
async function refresh_products() {
	pantalon = await friperie.get_categorie('pantalon');
	chemise = await friperie.get_categorie('chemise');
	veste = await friperie.get_categorie('veste');
	autre = await friperie.get_categorie('autre');
	type_combinaison = await friperie.get_categorie('type_combinaison');
	nb_de_produit = await friperie.get_categorie('cardinal');
	nb_de_combi = await friperie.get_categorie('cardinal_combi');
}

// récupère l'accessoire d'un produit si celui-ci en a un prédéfini
// renvoi les accessoires possibles pour ce produit sinon
async function accessoires(produit_id) {
	// seulement les pantalons et chemises ont des accessoires d'après le sujet
	for (colonne of pantalon.rows) {
		if (produit_id == colonne.id) {
			let accessoire = await friperie.get_accessoires(produit_id, "pantalon");
			if (accessoire.rows[0].accessoire === null) {
				return ["Ceinture", "Bretelles"];				
			} else {
				return [accessoire.rows[0].accessoire];
			}
		}
	}
	for (colonne of chemise.rows) {
		if (produit_id == colonne.id) {
			let accessoire = await friperie.get_accessoires(produit_id, "chemise");
			if (accessoire.rows[0].accessoire === null) {
				return ["Cravate", "Nœud papillon", "Pochette de costume"];
			} else {
				return [accessoire.rows[0].accessoire];
			}
		}
	}
	return [];
}

// rempli la variable globale tailles_pour_produit avec toutes les tailles de tous les produits
async function tableau_produits_tailles() {
	for (let i = 1; i <= nb_de_produit.rows[0].count; i++) {
		let tab = await friperie.get_tailles_produit(i);
		tailles_pour_produit[i.toString()] = tab;
	}
}

// enlève de l'inventaire un vêtement
async function update_inventaire_combinaison(produit_id, taille, quantite) {
	let quantite_initale = await friperie.get_quantite_initiale(produit_id, taille);
	await friperie.update_inventaire(produit_id, taille, quantite_initale.rows[0].quantite - quantite);
}

// remet les produits dans l'inventaire quand supprimé du panier
async function ajout_inventaire_from_panier(produit_id, taille, quantite) {
	let quantite_initale = await friperie.get_quantite_initiale(produit_id, taille);
	await friperie.update_inventaire(produit_id, taille, quantite_initale.rows[0].quantite + quantite);
}

run();

/* -------------------ROUTES DU CLIENT------------------- */

// page d'accueil pour le client
server.get("/", async (req,res) => {
	await refresh_products();
	let chemin_courant = "/";
	res.render('collection', 
	{pantalon : pantalon, chemise : chemise, veste : veste, autre : autre, type_combinaison : type_combinaison, 
	chemin_courant : chemin_courant, nb_de_produit : nb_de_produit, nb_de_combi : nb_de_combi});
});

// page pour un produit précis
server.get("/products/:produit", async (req,res) => {
	if (isNaN(req.params.produit)) {
		res.status(404).send("product not found.");
	} else {
		let produit_temp = await friperie.get_produit(req.params.produit);
		if(produit_temp.rows[0] === undefined) {
			res.status(404).send("product not found.");
		} else {
			let tailles_temp = await friperie.get_tailles_produit(req.params.produit);
			let accessoire = await accessoires(req.params.produit);
			res.render('produit_client', {produit : produit_temp, tailles : tailles_temp, accessoire : accessoire});
		}
	}
});

// route pour l'ajout au panier
server.post("/products/:produit", async (req,res) => {
	// pour vérifier si le produit était déjà dans le panier
	let produit = await friperie.get_from_panier(req.params.produit, req.body.taille, req.body.accessoire);

	// le produit n'est pas dans le panier on ajoute une nouvelle ligne
	if (produit == undefined || produit.rows.length === 0) {
		await friperie.insert_panier(req.params.produit, req.body.quantite, req.body.taille, req.body.prix, req.body.accessoire);
	} else {
		// le produit n'était pas dans le panier, on modifie la quantité dans panier
		let quantite_totale = parseFloat(req.body.quantite) + parseFloat(produit.rows[0].quantite);
		await friperie.update_panier(req.params.produit, quantite_totale, req.body.taille, req.body.prix, req.body.accessoire);
	}
	// on enlève de l'inventaire la quantité que l'utilisateur à choisi
	let quantite_initale = await friperie.get_quantite_initiale(req.params.produit, req.body.taille);
	await friperie.update_inventaire(req.params.produit, req.body.taille, quantite_initale.rows[0].quantite - req.body.quantite);
	res.status(200).send("produit ajouté au panier.");
});

// pour les combinaisons
server.get("/sets/:set_id", async (req,res) => {
	if(isNaN(req.params.set_id)) {
		res.status(404).send("set not found.");
	} else {
		await tableau_produits_tailles();
		let type_combinaison = await friperie.get_type_combinaison(req.params.set_id);
		let pantalon_sans_acc = await friperie.get_categorie_sans_accessoires('pantalon');
		let chemise_sans_acc = await friperie.get_categorie_sans_accessoires('chemise');
		let pantalon_business = await friperie.get_categorie_business('pantalon');
		let chemise_business = await friperie.get_categorie_business('chemise');
		res.render('combinaison', 
		{type_combinaison : type_combinaison, pantalon_sans_acc : pantalon_sans_acc, chemise_sans_acc : chemise_sans_acc,
		pantalon_business : pantalon_business, chemise_business : chemise_business, veste : veste, 
		tailles_pour_produit : tailles_pour_produit});
	}
});

// quand une combinaison est ajoutée au panier 
// il faut modifier l'inventaire de tous les produits qui la composent
server.post("/sets/:set_id", async(req,res) => {
	let type_combi = await friperie.get_type_combinaison(req.params.set_id);
	friperie.insert_combinaison(type_combi.rows[0].id, type_combi.rows[0].nom, type_combi.rows[0].descr, type_combi.rows[0].prix,
		 						req.body.pantalon, req.body.chemise, req.body.veste);
	let prix = type_combi.rows[0].prix;
	let max_id = await friperie.get_max_id_produit();
	let id = max_id.rows[0].max;
	let recap_taille = req.body.taille_pantalon + ',' + req.body.taille_chemise + ',' + req.body.taille_veste;
	await friperie.insert_panier(id, 1, recap_taille, prix, 'NULL');
	await update_inventaire_combinaison(req.body.pantalon, req.body.taille_pantalon, 1);
	await update_inventaire_combinaison(req.body.chemise, req.body.taille_chemise, 1);
	await update_inventaire_combinaison(req.body.veste, req.body.taille_veste, 1);
	res.status(200).send("produit ajouté au panier.");
});

server.get("/panier", async (req,res) => {
	let panier_temp = await friperie.get_panier();
	let prix_total = await friperie.get_prix_panier();
	res.render('panier', {panier : panier_temp, prix_total : prix_total});
});

// si on supprime des produits du panier, cette route POST est appelée
server.post("/panier", async (req,res) => {
	let combi = await friperie.get_combinaison(req.body.produit_id);
	await friperie.delete_from_panier(req.body.produit_id, req.body.taille, req.body.accessoire);
	if (combi === undefined || combi.rows.length === 0) {
		await ajout_inventaire_from_panier(req.body.produit_id, req.body.taille, parseInt(req.body.quantite));
	} else {
		// si le produit supprimé est une combinaison on doit remettre dans l'inventaire de chaque produit
		let tab_tailles_combi = req.body.taille.split(',');
		await ajout_inventaire_from_panier(combi.rows[0].pid, tab_tailles_combi[0], 1);
		await ajout_inventaire_from_panier(combi.rows[0].cid, tab_tailles_combi[1], 1);
		await ajout_inventaire_from_panier(combi.rows[0].vid, tab_tailles_combi[2], 1);
	}
	res.status(200).send("produit supprimé du panier.");
});

// pour qu'un client finalise sa commande
server.get("/formulaire", async (req,res) => {
	let panier_temp = await friperie.get_panier();
	let prix_total = await friperie.get_prix_panier();
	// on crée un tableaux contenant les 5 jours suivants
	// pour que le client choisisse sa date de livraison
	let jours = [];
	for (let i = 1; i <= 5; i++) {
		let jour_suivant = new Date();
		jour_suivant.setDate(jour_suivant.getDate() + i);
		let jour = jour_suivant.getDate().toString();
		let mois = jour_suivant.getMonth().toString();
		if(jour_suivant.getDate() < 10) {
			jour = '0' + jour_suivant.getDate().toString();
		}

		if(jour_suivant.getMonth() < 10) {
			mois = '0' + jour_suivant.getMonth().toString();
		}
		jours.push(jour_suivant.getFullYear().toString() + "-" + mois + "-" + jour);
	}
	res.render('formulaire', {panier : panier_temp, prix_total : prix_total, jours : jours});
});

// ajoute une commande dans la base de données
server.post("/formulaire", async (req, res) => {
	let max_id = await friperie.get_max_id_commande();
	let ids = await friperie.get_id_panier();
	await friperie.insert_commande(req.body.nom, req.body.prenom, req.body.adresse, req.body.num, req.body.email, 
									req.body.date + " " + req.body.heure, parseFloat(req.body.prix));
	await friperie.insert_article_commande(ids, max_id.rows[0].max);
	await friperie.delete_panier();
	res.redirect('/');
});

// -------------------------------------------------------------------------------


/* -------------------ROUTES RESERVEES AU GERANT------------------- */

// page d'accueil du gérant
server.get("/gerant", async (req,res) => {
	await refresh_products();
	let chemin_courant = "/gerant/";
	res.render('collection', 
	{pantalon : pantalon, chemise : chemise, veste : veste, autre : autre, type_combinaison : type_combinaison, 
	chemin_courant : chemin_courant, nb_de_produit : nb_de_produit, nb_de_combi : nb_de_combi});
});

server.get("/gerant/products/:produit", async (req,res) => {
	if (isNaN(req.params.produit)) {
		res.status(404).send("product not found.");
	} else {
		let produit_temp = await friperie.get_produit(req.params.produit);
		if(produit_temp.rows[0] === undefined) {
			res.status(404).send("product not found.");
		} else {
			let tailles_temp = await friperie.get_tailles_produit(req.params.produit);
			res.render('produit', {produit : produit_temp, tailles : tailles_temp});
		}
	}
});

// pour update les valeurs du stock selon le produit
server.post("/gerant/products/:produit", async (req,res) => {
	await friperie.update_tailles_produit(req.params.produit, [req.body.xs, req.body.s, req.body.m, req.body.l, req.body.xl]);
	res.status(200).send("stock update.");
});

server.get("/gerant/commandes", async (req,res) => {
	let commandes = await friperie.get_commandes();
	res.render('gestion_commandes', {commandes : commandes});
});

// quand le gérant supprime une commande c'est cette route qui est appelée
server.post("/gerant/commandes", async (req,res) => {
	for (let i = 0; i < req.body.commandes_supps.length; i++) {
		await friperie.delete_commande(req.body.commandes_supps[i]);
	}
	res.status(200).send("commandes supprimées.");
});

// ---------------------------------------------------------------------------

server.listen(port);