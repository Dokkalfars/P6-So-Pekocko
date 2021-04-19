const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    if (!req.body.errorMessage) {
        sauce.save()
        .then(() => {
            res.status(201).json({message: 'La sauce à été créée !'});
        })
        .catch(error => {
            if(error.message.indexOf("to be unique")>0) {
                req.body.errorMessage = "Le nom de la sauce existe déjà !";
            }
        next();
        })
    } else {
        next();
    }
};

exports.getSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => {
        res.status(200).json(sauces);
    })
    .catch(error => {
        res.status(400).json({message: error});
    });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        res.status(200).json(sauce);
    })
    .catch(error => {
        res.status(404).json({error: error});
    });
};

exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ?
    { 
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id}, {... sauceObject, _id: req.params.id})
    .then(() => res.status(200).json({message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({error}));
};

exports.deletedSauce = (req, res, next) => {
    Sauce.findOne({ _id : req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id})
            .then(() => res.status(200).json({ message: 'La sauce a été supprimée !'}))
            .catch(error => res.status(400).json({error}));
        })
    })
    .catch(error => status(500).json({error}));
};

exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {

        // Verification que l'utilisateur n'a pas déjà LIKER la sauce
        case 0:
          Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
              if (sauce.usersLiked.find(user => user === req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { likes: -1 },
                  $pull: { usersLiked: req.body.userId },
                  _id: req.params.id
                })
                  .then(() => { res.status(201).json({ message: 'Ton avis a été pris en compte!' }); })
                  .catch((error) => { res.status(400).json({ error: error }); });
    
                  // Verification que l'utilisateur n'a pas déjà DISLIKER la sauce
              } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { dislikes: -1 },
                  $pull: { usersDisliked: req.body.userId },
                  _id: req.params.id
                })
                  .then(() => { res.status(201).json({ message: 'Ton avis a été pris en compte!' }); })
                  .catch((error) => { res.status(400).json({ error: error }); });
              }
            })
            .catch((error) => { res.status(404).json({ error: error }); });
          break;
        //likes = 1
        case 1:
          Sauce.updateOne({ _id: req.params.id }, {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
            _id: req.params.id
          })
            .then(() => { res.status(201).json({ message: 'Ton like a été pris en compte!' }); })
            .catch((error) => { res.status(400).json({ error: error }); });
          break;
        //likes = -1
        case -1:
          Sauce.updateOne({ _id: req.params.id }, {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
            _id: req.params.id
          })
            .then(() => { res.status(201).json({ message: 'Ton dislike a été pris en compte!' }); })
            .catch((error) => { res.status(400).json({ error: error }); });
          break;
        default:
          console.error('oups ! mauvaise requête ! ');
      }
};