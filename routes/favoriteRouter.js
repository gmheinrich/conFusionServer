const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router({ mergeParams: true });

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne( { user : req.user._id })
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne( { user : req.user._id } )
        .then((favorites) => {
            if (favorites == null) {
                Favorites.create( { user: req.user._id, dishes: [] } )
                    .then((favorites) => {
                        console.log('Favorites User Created');
                        for ( var i = 0; i < req.body.length; i++ ) {
                            favorites.dishes.push(req.body[i]);
                        }
                        favorites.save()
                            .then((favorites) => {
                                Favorites.findById(favorites._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    })
                            }, (err) => next(err));
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
            else {
                console.log('Favorites User Exists');
                for ( var i = 0; i < req.body.length; i++ ) {
                    if ( favorites.dishes.indexOf(req.body[i]._id) == -1 ) {
                        console.log('Favorites added ', i, favorites);
                        favorites.dishes.push(req.body[i]);
                    }
                }
                favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                            })
                    }, (err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove( { user : req.user._id } )
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .then((favorites) => {
            if (!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'Application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'Application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'Application/json');
                    return res.json({"exists": true, "favorites": favorites});
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne( { user : req.user._id } )
        .then((favorites) => {
            if (favorites == null) {
                Favorites.create( { user: req.user._id, dishes: [] } )
                    .then((favorites) => {
                        console.log('Favorites User Created');
                        if ( favorites.dishes.indexOf(req.params.dishId) == -1 ) {
                            console.log('Favorites added ', req.params.dishId);
                            favorites.dishes.push(req.params.dishId);
                            favorites.save()
                            .then((favorites) => {
                                Favorites.findById(favorites._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    })
                            }, (err) => next(err));
                        }
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
            else {
                console.log('Favorites User Exists');
                if ( favorites.dishes.indexOf(req.params.dishId) == -1 ) {
                    console.log('Favorites added ', req.params.dishId);
                    favorites.dishes.push(req.params.dishId);
                    favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            })
                    }, (err) => next(err));
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne( { user : req.user._id } )
        .then((favorites) => {
            if ( favorites != null ) {
                console.log('Favorites User Exists');
                if ( favorites.dishes.indexOf(req.params.dishId) != -1 ) {
                    console.log('Favorites Dish Deleted ', req.params.dishId);
                    favorites.dishes.pull(req.params.dishId);
                    favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            })
                    }, (err) => next(err));
                }
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params._id + ' not in your Favorites');    
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favoriteRouter;