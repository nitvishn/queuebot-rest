var express = require('express');
var mappingRouter = express.Router();
var MappingModel = require('../models/mappingModel')
var QueueModel = require('../models/queueModel')

mappingRouter.route('/')
    .get((req, res, next) => {
        MappingModel.find({})
            .then((mappings) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(mappings);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        MappingModel.findOne({ queueId: req.body.queueId })
            .then((mapping) => {
                if (mapping == null) {
                    MappingModel.create({ queueId: req.body.queueId, discord_channel: req.body.channel })
                } else {
                    mapping.discord_channel = req.body.channel;
                    mapping.save();
                }
            }, (err) => next(err))
            .then(() => {
                QueueModel.findById(req.body.queueId)
                    .then((queueObj) => {
                        queueObj.discord_channel = req.body.channel;
                        queueObj.save().
                            then((queueObj) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(queueObj);
                            }, (err) => next(err))
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        MappingModel.find({})
            .then((mappings) => {
                mappings.map((mapping) => {
                    QueueModel.findById(mapping.queueId)
                        .then((queueObj) => {
                            if (queueObj) {
                                queueObj.discord_channel = null;
                                queueObj.save();
                            }
                        });
                });
            })
            .then(() => {
                MappingModel.deleteMany()
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    });
            });
    });

module.exports = mappingRouter;