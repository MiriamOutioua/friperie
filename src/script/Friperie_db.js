//fichier centralisant les fonctions pour requêtes et misc

function Friperie_db() {
    const pg = require('pg');
	const pool = new pg.Pool({
		user:'gerant',
		host:'localhost',
		database:'friperie',
		password:'mY_friperieX97',
		port:5432,
		schema:'public'
	});
    
	let client;
	
	this.connect = async function() {
		try {
			client = await pool.connect();
		} catch(error) {
			console.error(`ERROR CONNECT METHOD: ${error}`);
		}
	}

	this.release_client = async function() {
		try {
			await client.release();
		} catch(error) {
			console.error(`ERROR RELEASE METHOD: ${error}`);
		}
	}

	// récupère les informations de tous les produits d'une catégorie donnée
    this.get_categorie = async function(categorie) {
        let requete;
		try {
			switch(categorie) {
				case 'pantalon':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN pantalon ON (produit.id = pid)");
				   break;
				case 'chemise':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN chemise ON (produit.id = cid)");
					break;
				case 'veste':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN veste ON (produit.id = vid)");
				   break;
				case 'autre':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN autre ON (produit.id = aid)");
				   break;
				case 'type_combinaison':
					requete = await client.query("SELECT * FROM type_combinaison");
					break;
				case 'cardinal':
					requete = await client.query("SELECT count(*) FROM produit WHERE nom NOT LIKE 'Combinaison%'");
					break;
				case 'cardinal_combi':
					requete = await client.query("SELECT count(*) FROM type_combinaison");
					break;
				default:
					console.log("Catégorie non disponible.");
					break;
			}	
		} catch (error) {
			console.error(`ERROR GET_CATEGORIE: ${error}`);
		}
		return requete;
    }

	// récupère les informations des produits n'ayant aucun accessoire selon une catégorie
	this.get_categorie_sans_accessoires = async function(categorie) {
		let requete;
		try {
			switch(categorie) {
				case 'pantalon':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN pantalon ON (produit.id = pid) WHERE accessoire IS NULL");
					break;
				case 'chemise':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN chemise ON (produit.id = cid) WHERE accessoire IS NULL");
					break;
				default:
					console.log("Catégorie non disponible.");
					break;
			}
		} catch(error) {
			console.error(`ERROR GET_CATEGORIE_SANS_ACCESSOIRES: ${error}`);
		}
		return requete;
	}

	// les pantalons ayant une ceinture et les chemise ayant des cravates font parti de la catégorie business
	this.get_categorie_business = async function(categorie) {
		let requete;
		try {
			switch(categorie) {
				case 'pantalon':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN pantalon ON (produit.id = pid) WHERE accessoire='Ceinture'");
					break;
				case 'chemise':
					requete = await client.query("SELECT nom, prix, descr, produit.id, img FROM produit JOIN chemise ON (produit.id = cid) WHERE accessoire='Cravate'");
					break;
				default:
					console.log("Catégorie non disponible.");
					break;
			}
		} catch(error) {
			console.error(`ERROR GET_CATEGORIE_BUSINESS: ${error}`);
		}
		return requete;
	}

	// récupère les quantités de produit_id pour chaque taille
	this.get_tailles_produit = async function(produit_id) {
		//requete = tableau de résultats de requêtes sur la quantité de stock selon la taille
		let requete = [];
		try {
			requete["XS"] = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='XS'");
			requete["S"] = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='S'");
			requete["M"] = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='M'");
			requete["L"] = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='L'");
			requete["XL"] = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='XL'");
		} catch (error) {
			console.error(`ERROR GET_TAILLES: ${error}`);
		}
		return requete;
	}

	// récupère toutes les informations d'un seul produit
	this.get_produit = async function(produit_id) {
		let requete;
		try {
			requete = await client.query("SELECT * FROM produit WHERE id=" + produit_id);
		} catch (error) {
			console.error(`ERROR GET_PRODUIT: ${error}`);
		}
		return requete;
	}

	this.get_type_combinaison = async function(set_id) {
		let requete;
		try {
			requete = await client.query("SELECT * FROM type_combinaison WHERE id=" + set_id);
		} catch (error) {
			console.error(`ERROR GET_TYPE_COMBINAISON: ${error}`);
		}
		return requete;
	}

	// les composants d'une combinaison donnée
	this.get_combinaison = async function(produit_id) {
		let requete;
		try {
			requete = await client.query("SELECT pid, cid, vid FROM combinaison WHERE produit_id=" + produit_id);
		} catch (error) {
			console.error(`ERROR GET_COMBINAISON: ${error}`);
		}
		return requete;
	}

	this.get_max_id_produit = async function() {
		let requete;
		try {
			requete = await client.query("SELECT MAX(id) FROM produit");
		} catch (error) {
			console.error(`ERROR GET_MAX_ID_PRODUIT: ${error}`);
		}
		return requete;
	}

	this.insert_combinaison = async function(type_id, nom, descr, prix, pantalon, chemise, veste) {
		try {
			//on ajoute d'abord un nouveau produit avant de créer la combinaison
			await client.query("INSERT INTO produit (nom, descr, prix) VALUES ('" + nom + "', '" + descr + "', " + prix + ")");
			let produit_id = await this.get_max_id_produit();
			await client.query("INSERT INTO combinaison (nom, produit_id, type_id, pid, cid, vid) VALUES ('" + nom + "', " + produit_id.rows[0].max + ", " + 
			type_id + ", " + pantalon + ", " + chemise + ", " + veste + ")");
		} catch (error) {
			console.error(`ERROR INSERT_COMBINAISON: ${error}`);
		}
	}

	this.get_accessoires = async function(produit_id, categorie) {
		let requete;
		try {
			switch (categorie) {
				case 'pantalon':
					requete = await client.query("SELECT accessoire FROM pantalon WHERE pid=" + produit_id);
					break;
				case 'chemise':
					requete = await client.query("SELECT accessoire FROM chemise WHERE cid=" + produit_id);
					break;
				default:
					console.log("Catégorie non disponible.");
					break;
			}
		} catch (error) {
			console.error(`ERROR GET_ACCESSOIRES: ${error}`);
		}
		return requete;
	}

	// modifie les quantités dans inventaire pour un produit selon un tableau contenant les nouvelles valeurs
	this.update_tailles_produit = async function(produit_id, tableau_tailles) {
		try {
			await client.query("UPDATE inventaire SET quantite=" + tableau_tailles[0] + " WHERE taille='XS' AND pid=" + produit_id);
			await client.query("UPDATE inventaire SET quantite=" + tableau_tailles[1] + " WHERE taille='S' AND pid=" + produit_id);
			await client.query("UPDATE inventaire SET quantite=" + tableau_tailles[2] + " WHERE taille='M' AND pid=" + produit_id);
			await client.query("UPDATE inventaire SET quantite=" + tableau_tailles[3] + " WHERE taille='L' AND pid=" + produit_id);
			await client.query("UPDATE inventaire SET quantite=" + tableau_tailles[4] + " WHERE taille='XL' AND pid=" + produit_id);
		} catch(error) {
			console.error(`ERROR UPDATE_TAILLES_PRODUIT: ${error}`);
		}

		console.log("stock du produit actualisé.")
	}

	this.get_commandes = async function() {
		let requete;
		try {
			requete = await client.query("SELECT * FROM commande");
		} catch (error) {
			console.error(`ERROR GET_COMMANDES: ${error}`);
		}
		return requete;
	}

	this.insert_commande = async function(nom, prenom, adresse, num, mail, heure, prix) {
		try {
			const query = {
				text: "INSERT INTO commande (nom, prenom, adresse, num, mail, heure_livraison, prix, stat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				values: [nom, prenom, adresse, num, mail, heure, prix, 'EN COURS']
			};
			await client.query(query);
		} catch (error) {
			console.error(`ERROR INSERT_COMMANDE: ${error}`);
		}
	}

	this.delete_commande = async function(commande_id) {
		try {
			await client.query("DELETE FROM article_commande WHERE commande_id=" + commande_id);
			await client.query("DELETE FROM commande WHERE id=" + commande_id);
		} catch (error) {
			console.error(`ERROR DELETE_COMMANDE: ${error}`);
		}
	}

	this.get_max_id_commande = async function() {
		let requete;
		try {
			requete = await client.query("SELECT MAX(id) FROM commande");
		} catch (error) {
			console.error(`ERROR GET_MAX_ID_COMMANDE: ${error}`);
		}
		return requete;
	}

	this.insert_article_commande = async function(ids, max_id) {
		try {
			for (i of ids.rows) {
				await client.query("INSERT INTO article_commande (commande_id, produit_id) VALUES (" + max_id + ", " + i.pid + ")");
			}
		} catch (error) {
			console.error(`ERROR INSERT_ARTICLE_COMMANDE: ${error}`);
		}
	}

	// récupère tous les produits contenus dans le panier
	this.get_panier = async function() {
		let requete;
		try {
			requete = await client.query("SELECT panier.id, pid, taille, quantite, panier.prix, accessoire, nom FROM panier JOIN produit ON pid=produit.id");
		} catch (error) {
			console.error(`ERROR GET_PANIER: ${error}`);
		}
		return requete;
	}

	// tous les ids des produits dans le panier
	this.get_id_panier = async function() {
		let requete;
		try {
			requete = await client.query("SELECT pid FROM panier");
		} catch (error) {
			console.error(`ERROR GET_ID_PANIER: ${error}`);
		}
		return requete;
	}

	// récupère la quantité d'un produit correspondant aux arguments donnés
	// servira à vérifier si un produit d'une taille et d'un accessoire donnés est dans le panier
	this.get_from_panier = async function(produit_id, taille, accessoire) {
		let requete;
		try {
			requete = await client.query("SELECT quantite FROM panier WHERE pid=" + produit_id + " AND taille='" + taille + "' AND accessoire='" + accessoire + "'");
		} catch (error) {
			console.error(`ERROR GET_FROM_PANIER: ${error}`);
		}
		return requete;
	}

	this.insert_panier = async function(produit_id, quantite, taille, prix, accessoire) {
		try {
			let prix_total = quantite * prix;
			if (accessoire == "NULL") {
				await client.query("INSERT INTO panier (pid, quantite, taille, prix, accessoire) VALUES (" + produit_id + ", " + quantite + ", '" + taille + "', " + prix_total + ", 'NULL')");
			} else {
				await client.query("INSERT INTO panier (pid, quantite, taille, prix, accessoire) VALUES (" + produit_id + ", " + quantite + ", '" + taille + "', " + prix_total + ", '" + accessoire +  "')");
			}
		} catch (error) {
			console.error(`ERROR INSERT_PANIER: ${error}`);
		}
	}

	this.update_panier = async function(produit_id, quantite, taille, prix, accessoire) {
		try {
			let prix_total = quantite * prix;
			if (accessoire == "NULL") {
				await client.query("UPDATE panier SET quantite=" + quantite + ", prix=" + prix_total + " WHERE pid=" + produit_id + " AND taille='" + taille + "' AND accessoire='NULL'");
			} else {
				await client.query("UPDATE panier SET quantite=" + quantite + ", prix=" + prix_total + " WHERE pid=" + produit_id + " AND taille='" + taille + "' AND accessoire='" + accessoire + "'");
			}
		} catch (error) {
			console.error(`ERROR UPDATE_PANIER: ${error}`);
		}
	}

	// prix total du panier
	this.get_prix_panier = async function() {
		let prix_total;
		try {
			prix_total = await client.query("SELECT SUM(prix) FROM panier");
			return prix_total;
		} catch (error) {
			console.error(`ERROR GET_PRIX_PANIER: ${error}`);
		}
	}

	// supprime un produit du panier
	this.delete_from_panier = async function(produit_id, taille, accessoire) {
		try {
			if (accessoire == "Pas d'accessoire") {
				await client.query("DELETE FROM panier WHERE pid=" + produit_id + " AND taille='" + taille + "' AND accessoire='NULL'");
			} else {
				await client.query("DELETE FROM panier WHERE pid=" + produit_id + " AND taille='" + taille + "' AND accessoire='" + accessoire + "'");
			}
		} catch (error) {
			console.error(`ERROR DELETE_FROM_PANIER: ${error}`);
		}
	}

	this.update_inventaire = async function(produit_id, taille, quantite_apres_commande) {
		try {
			await client.query("UPDATE inventaire SET quantite=" + quantite_apres_commande + " WHERE pid=" + produit_id + " AND taille='" + taille + "'");
		} catch (error) {
			console.error(`ERROR UPDATE_INVENTAIRE: ${error}`);
		}	
	}

	// supprime tous les produits du panier
	this.delete_panier = async function() {
		try {
			await client.query("DELETE FROM panier");
		} catch (error) {
			console.error(`ERROR DELETE_PANIER: ${error}`);
		}
	}

	// récupère la quantité depuis l'inventaire d'un produit d'une certaine taille
	this.get_quantite_initiale = async function(produit_id, taille) {
		let requete;
		try {
			requete = await client.query("SELECT quantite FROM inventaire WHERE pid=" + produit_id + " AND taille='" + taille + "'");
		} catch (error) {
			console.error(`ERROR GET_QUANTITE_INITIALE: ${error}`);
		}
		return requete;
	}
}

module.exports = new Friperie_db();