// ORM mongoose
var mongoose = require('mongoose');

// Importation des schema.
var livreurSchema = require('../models/livreurModele.js').livreurSchema;
var usagerSchema = require('../models/usagerModele.js').usagerSchema;
var platsSchema = require('../models/platsModele.js').platsSchema;

// Création du shéma usager
var commandeSchema = new mongoose.Schema({
    DateArrivee: {
        type: String,
        require: true
    },
    Livreur: livreurSchema,
    Usager: usagerSchema,
    Plats: [
        platsSchema
    ]
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.CommandeModele = mongoose.model('Commande', commandeSchema);