// ORM mongoose
var mongoose = require('mongoose');


// Création du shéma usager
var platsSchema = new mongoose.Schema({
    Nom: {
        type: String,
        require: true
    },
    NbrPortions: {
        type: Number,
        require: true
    }
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.PlatsModele = mongoose.model('Plats', platsSchema);
// Exportation du schema pour pouvoir l'utiliser dans un autres schema.
module.exports.platsSchema = mongoose.Schema(platsSchema);