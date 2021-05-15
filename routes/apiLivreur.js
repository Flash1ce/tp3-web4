'use strict';

var express = require('express');

var routerLivreur = express.Router();

// URL de base
var url_base = "https://tp3-bedardantoine.herokuapp.com/";
// ORM Mongoose
var mongoose = require('mongoose');

// Connection a la bd mongoDB
mongoose.connect('mongodb+srv://antoine:bedard@cluster0.m8uqr.mongodb.net/tp3WebAB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

// Importation du modele usager.
var LivreurModele = require('../models/livreurModele').LivreurModele;


routerLivreur.route('/livreurs')
    // Permet de crée un livreur.
    .post(function (req, res) {
        if (req.body.Nom && req.body.Prenom && req.body.Voiture && req.body.Quartier && Object.keys(req.body).length === 4) {
            console.log("Création du livreur");

            var nouveauLivreur = new LivreurModele(req.body);
    
            nouveauLivreur.save(function (err) {
                if (err) throw err;
    
                res.status(201).location(url_base + 'livreurs/' + nouveauLivreur._id).json(nouveauLivreur);
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

routerLivreur.route('/livreurs/:livreur_id')
    // Permet de consulter le livreur ayant l'id livreur_id.
    .get(function (req, res) {
        var livreurID = req.params.livreur_id; // id du livreur dans la request.

        console.log("Consultation du livreur avec l'id : " + livreurID);

        // Validation que l'id est bien de 24 char sinon.
        if (livreurID.length === 24) {
            // Recherche du livreur qui a l'id fournis en params.
            LivreurModele.findById(livreurID, function (err, livreur) {
                // if (err) throw err; // lancement des erreurs.
                if (livreur) res.status(200).json(livreur); // return 200 et le json du livreur trouver.
                else res.status(404).end(); // return 404 si le livreur n'est pas trouvé.
            });
        } else {
            res.status(400).end();
        }
    })
    // Permet de supprimer le livreur ayant l'id livreur_id.
    .delete(function (req, res) {
        var livreurID = req.params.livreur_id; // id du livreur dans la request.

        console.log('Supprimer le livreur ayant l\'id : ' + livreurID);

        // Validation que l'id est bien de 24 char.
        if (livreurID.length === 24) {
            // Supprime le livreur ayant l'id livreurID.
            LivreurModele.findByIdAndDelete(livreurID, function (err) {
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
module.exports = routerLivreur;