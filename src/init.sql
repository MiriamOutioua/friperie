DROP USER IF EXISTS gerant;
CREATE USER gerant WITH PASSWORD 'mY_friperieX97';
GRANT ALL PRIVILEGES ON DATABASE friperie TO gerant;
ALTER USER gerant WITH SUPERUSER;

DROP TABLE IF EXISTS produit CASCADE;
DROP TABLE IF EXISTS inventaire CASCADE;
DROP TABLE IF EXISTS pantalon CASCADE;
DROP TABLE IF EXISTS chemise CASCADE;
DROP TABLE IF EXISTS veste CASCADE;
DROP TABLE IF EXISTS autre CASCADE;
DROP TABLE IF EXISTS combinaison CASCADE;
DROP TABLE IF EXISTS type_combinaison CASCADE;
DROP TABLE IF EXISTS commande CASCADE;
DROP TABLE IF EXISTS article_commande CASCADE;
DROP TABLE IF EXISTS panier CASCADE;

-- création des tables 

create table friperie.public.produit (
	id serial primary key,
    nom varchar(30),
    descr varchar(50),
	prix decimal(4,2),
	img varchar(50)
);

create table friperie.public.inventaire (
	id serial primary key,
	pid integer,
	taille varchar(2),
	quantite integer,
	foreign key (pid) references produit(id)
);

create table friperie.public.pantalon (
	id serial primary key,
	pid integer UNIQUE,
	type_p varchar(30),
	accessoire varchar(20),
    foreign key (pid) references produit(id)
);

create table friperie.public.chemise (
	id serial primary key,
	cid integer UNIQUE, 
	couleur varchar(30),
	accessoire varchar(20),
    foreign key (cid) references produit(id)
);

create table friperie.public.veste (
	id serial primary key,
	vid integer UNIQUE,
	type_veste varchar(30),
    foreign key (vid) references produit(id)
);

create table friperie.public.autre (
	id serial primary key,
	aid integer UNIQUE,
	type_produit varchar(30),
    foreign key (aid) references produit(id)
);

create table friperie.public.type_combinaison (
	id serial primary key,
	nom varchar(30),
	descr varchar(50),
	prix decimal(4,2),
	img varchar(50)
);

create table friperie.public.combinaison (
	id serial primary key,
	nom varchar(30),
	produit_id integer,
	type_id integer,
	pid integer,
	cid integer,
	vid integer,
	foreign key (produit_id) references produit(id),
	foreign key (type_id) references type_combinaison(id),
    foreign key (pid) references pantalon(pid),
    foreign key (cid) references chemise(cid),
    foreign key (vid) references veste(vid)
);

create table friperie.public.commande (
	id serial primary key,
	nom varchar(30),
	prenom varchar(30),
	adresse varchar(80),
	num varchar(30),
	mail varchar(50),
	heure_livraison varchar(20),
	prix decimal(10,2),
	stat varchar(30)
);

create table friperie.public.article_commande (
	id serial primary key,
	commande_id integer,
	produit_id integer,
	foreign key (commande_id) references commande(id),
	foreign key (produit_id) references produit(id)
);

create table friperie.public.panier (
	id serial primary key,
	pid integer, 
	quantite integer, 
	taille varchar(8),
	prix decimal(10,2),
	accessoire varchar(20),
	foreign key (pid) references produit(id)
);

-- alimentation des tables 

insert into produit (nom, descr, prix, img) values 
-- pantalon
('Jean', 'Un jean classique usé avec ceinture.', 9.50, '/media/jean.jpg'),
('Chino','Un chino pour homme beige.', 17.00, '/media/chino.jpg'),
('Jogging', 'Un jogging noir coupe-vent.', 12.00, '/media/jogging.jpg'),
('Short', 'Un short simple blanc avec bretelles.', 6.50, '/media/short.jpg'),
('Jean', 'Un jean noir troué.', 7.00, '/media/jean_noir.jpg'),
('Pantalon', 'Un pantalon à pinces marron clair avec ceinture.', 19.00, '/media/pantalon_pince.jpg'),
-- chemise
('Chemise', 'Une chemise blanche simple avec noeud papillon', 7.00, '/media/chemise_noeud.jpg'),
('Chemise', 'Une chemise rouge à carreaux', 9.25, '/media/chemise_rouge.jpg'),
('Chemise', 'Une chemise noire à manches bouffantes', 12.00, '/media/chemise_noire.jpg'),
('Chemise', 'Une chemise blanche avec cravate rouge', 15.75, '/media/cravate_rouge.jpg'),
-- veste
('Veste', 'Une veste noire en cuir.', 17.00, '/media/veste_cuir.jpg'),
('Veste', 'Une veste en jean.', 14.50, '/media/veste_jean.jpg'),
('Veste', 'Une veste rose pastel en laine.', 11.00, '/media/veste_laine.jpg'),
('Veste', 'Une veste de costume.', 22.00, '/media/veste_costume.jpg'),
-- autre
('Pull', 'Un pull gris.', 8.99, '/media/pull.jpg'),
('Sweat', 'Un sweat à capuche mauve.', 13.50, '/media/sweat.jpg');

insert into pantalon (pid, type_p, accessoire) values 
(1, 'Jean', 'Ceinture'),
(2, 'Chino', NULL),
(3, 'Jogging', NULL),
(4, 'Short', 'Bretelles'),
(5, 'Jean', NULL),
(6, 'Pantalon', 'Ceinture');

insert into chemise (cid, couleur, accessoire) values
(7, 'Blanche', 'Noeud papillon'),
(8, 'Rouge', NULL),
(9, 'Noire', NULL),
(10, 'Blanche', 'Cravate');

insert into veste (vid, type_veste) values
(11, 'Cuir'),
(12, 'Jean'),
(13, 'Laine'),
(14, 'Costume');

insert into autre (aid, type_produit) values
(15, 'Pull'),
(16, 'Sweat');

insert into type_combinaison (nom, descr, prix, img) values 
('Combinaison basique', 'Une sélection de produits basiques.', 25.00, '/media/purple.jpg'),
('Combinaison deluxe', 'Une sélection de produits avec accessoires.', 40.00, '/media/black.jpg');

insert into inventaire (pid, taille, quantite) values
(1, 'XS', 1),
(1, 'S', 1),
(1, 'M', 1),
(1, 'L', 1),
(1, 'XL', 1),
(2, 'XS', 1),
(2, 'S', 1),
(2, 'M', 1),
(2, 'L', 1),
(2, 'XL', 1),
(3, 'XS', 1),
(3, 'S', 1),
(3, 'M', 1),
(3, 'L', 1),
(3, 'XL', 1),
(4, 'XS', 1),
(4, 'S', 1),
(4, 'M', 1),
(4, 'L', 1),
(4, 'XL', 1),
(5, 'XS', 1),
(5, 'S', 1),
(5, 'M', 1),
(5, 'L', 1),
(5, 'XL', 1),
(6, 'XS', 1),
(6, 'S', 1),
(6, 'M', 1),
(6, 'L', 1),
(6, 'XL', 1),
(7, 'XS', 1),
(7, 'S', 1),
(7, 'M', 1),
(7, 'L', 1),
(7, 'XL', 1),
(8, 'XS', 1),
(8, 'S', 1),
(8, 'M', 1),
(8, 'L', 1),
(8, 'XL', 1),
(9, 'XS', 1),
(9, 'S', 1),
(9, 'M', 1),
(9, 'L', 1),
(9, 'XL', 1),
(10, 'XS', 1),
(10, 'S', 1),
(10, 'M', 1),
(10, 'L', 1),
(10, 'XL', 1),
(11, 'XS', 1),
(11, 'S', 1),
(11, 'M', 1),
(11, 'L', 1),
(11, 'XL', 1),
(12, 'XS', 1),
(12, 'S', 1),
(12, 'M', 1),
(12, 'L', 1),
(12, 'XL', 1),
(13, 'XS', 1),
(13, 'S', 1),
(13, 'M', 1),
(13, 'L', 1),
(13, 'XL', 1),
(14, 'XS', 1),
(14, 'S', 1),
(14, 'M', 1),
(14, 'L', 1),
(14, 'XL', 1),
(15, 'XS', 1),
(15, 'S', 1),
(15, 'M', 1),
(15, 'L', 1),
(15, 'XL', 1),
(16, 'XS', 1),
(16, 'S', 1),
(16, 'M', 1),
(16, 'L', 1),
(16, 'XL', 1);

insert into commande (nom, prenom, adresse, num, mail, heure_livraison, prix, stat) values 
('Bloggs', 'Jane', '4067 Stratford Drive, Hawaii/US', '06578XX408', 'jane.bloggs@gmail.com', '2023-04-26 15:30:00', 15.99, 'EN COURS'),
('Space', 'Phil', '11 Park Avenue, Lawers/UK', '078XX12333', 'space-philly@hotmail.com', '2022-01-24 09:26:41', 9.25, 'LIVREE'),
('Kunlai', 'Lian', 'Hing Yip Street, Southern District/Hong Kong', '06348454XX', 'kukulian@yahoo.com', '2023-01-04 17:38:21', 14.50, 'LIVREE'),
('Dupont', 'Marie', 'Rue de la Paix 123', '0123XX6789', 'marie.dupont@hotmail.fr', '2023-05-29 18:00:00', 50.00, 'EN COURS'),
('Martin', 'Pierre', 'Avenue des Roses 456', '9XX6543210', 'pierre.martin@free.fr', '2022-08-10 12:00:00', 75.50, 'LIVREE'),
('Lefebvre', 'Sophie', 'Boulevard du Commerce 789', '56789012XX', 'sophie.lefebvre@gmail.com', '2020-04-15 11:00:00', 35.20, 'LIVREE'),
 ('Dubois', 'Jean', 'Rue de la Liberté 567', '43XX098765', 'jean.dubois@gmail.com', '2022-09-01 16:45:00', 42.80, 'LIVREE');

insert into article_commande (commande_id, produit_id) values
(1, 5),
(1, 15),
(2, 8),
(3, 12);

insert into panier (pid, quantite, taille, prix, accessoire) values
(1, 1, 'M', 9.50, 'Ceinture'),
(3, 1, 'L', 12.00, 'NULL'),
(10, 1, 'L', 15.75, 'Cravate'),
(6, 1, 'L', 19.00, 'Ceinture'),
(4, 1, 'L', 6.50, 'Bretelles'),
(11, 1, 'L', 17.00, 'NULL');