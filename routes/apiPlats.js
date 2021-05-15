'use strict';

var express = require('express');

var routerPlats = express.Router();

// URL de base
var url_base = "http://localhost:8090";
// ORM Mongoose
var mongoose = require('mongoose');

// Connection a la bd mongoDB
mongoose.connect('mongodb://localhost:27017/tp3WebAB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

// Importation du modele usager.
var PlatsModele = require('../models/platsModele').PlatsModele;

var cors = require('cors'); // importation de cors.
const whitelist = ["https://www.delirescalade.com", "https://www.chess.com", "https://cegepgarneau.omnivox.ca"];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET"
};

// Route pour consulter tous les plats.
routerPlats.get('/plats', cors(corsOptions), function (req, res) {
    console.log("Obtenir tout les plats.");

    PlatsModele.find({}, function (err, plats) {
        if (err) throw err;

        // ajouts des links dans la reponse.
        var platsJson = [];
        plats.forEach(plat => {
            platsJson.push({
                "_id": plat._id,
                "Nom": plat.Nom,
                "NbrPortions": plat.NbrPortions,
                "__v": plat.__v,
                "links": [{
                    rel: "self",
                    method: "GET",
                    href: url_base + "/plats/" + plat._id.toString()
                }, {
                    rel: "delete",
                    method: "DELETE",
                    href: url_base + "/plats/" + plat._id.toString()
                }, {
                    rel: "all",
                    method: "GET",
                    href: url_base + "/plats"
                }, {
                    rel: "post",
                    method: "POST",
                    href: url_base + "/plats"
                }]
            });
        });

        res.status(200).json(platsJson); // return tous les plats.
    });
});

routerPlats.route('/plats')
    // Route pour la création d'un plats.
    .post(function (req, res) {
        if (req.body.Nom && req.body.NbrPortions && Object.keys(req.body).length === 2) {
            console.log("Création d'un plats");
            var nouveauPlat = new PlatsModele(req.body);
    
            nouveauPlat.save(function (err) {
                if (err) throw err;
    
                res.status(201).location(url_base + 'plats/' + nouveauPlat._id).json(nouveauPlat, [{
                        rel: "self",
                        method: "GET",
                        href: url_base + "/plats/" + nouveauPlat._id.toString()
                    },
                    {
                        rel: "delete",
                        method: "DELETE",
                        href: url_base + "/plats/" + nouveauPlat._id.toString()
                    },
                    {
                        rel: "all",
                        method: "GET",
                        href: url_base + "/plats"
                    }, {
                        rel: "post",
                        method: "POST",
                        href: url_base + "/plats"
                    }
                ]);
            });
        } else {
            res.status(400).end();
        }
        
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

routerPlats.route('/plats/:plat_id')
    // Permet de consulter le plat ayant l'id "plat_id".
    .get(function (req, res) {
        var platID = req.params.plat_id; // id du plat dans la request.

        console.log("Consultation du plat avec l'id : " + platID);

        // Validation que l'id est bien de 24 char sinon.
        if (platID.length === 24) {
            // Recherche du plat qui a l'id fournis en params.
            PlatsModele.findById(platID, function (err, plat) {
                if (err) throw err; // lancement des erreurs.
                if (plat) res.status(200).json(plat, [{
                    rel: "self",
                    method: "GET",
                    href: url_base + "/plats/" + plat._id.toString()
                }, {
                    rel: "delete",
                    method: "DELETE",
                    href: url_base + "/plats/" + plat._id.toString()
                }, {
                    rel: "all",
                    method: "GET",
                    href: url_base + "/plats"
                }, {
                    rel: "post",
                    method: "POST",
                    href: url_base + "/plats"
                }]); // return 200 et le json du plat trouver.
                else res.status(404).end(); // return 404 si le plat n'est pas trouvé.
            });
        } else {
            res.status(400).end();
        }
    })
    // Permet de supprimer le plat ayant l'id "plat_id".
    .delete(function (req, res) {
        var platID = req.params.plat_id; // id du plat dans la request.

        console.log('Supprimer le plat ayant l\'id : ' + platID);

        // Validation que l'id est bien de 24 char.
        if (platID.length === 24) {
            // Supprime le plat ayant l'id platID.
            PlatsModele.findByIdAndDelete(platID, function (err) {
                if (err) throw err; // lancement des erreurs.

                res.status(204).end();
            });
        } else {
            res.status(400).end();
        }
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });


// Exportation de l'objet routerUsagers pour pouvoir l'utiliser.
module.exports = routerPlats;