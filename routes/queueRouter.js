const express = require('express');
const bodyParser = require('body-parser');
var QueueModel = require("../models/queueModel");
const MappingModel = require('../models/mappingModel');

const queueRouter = express.Router();

queueRouter.use(bodyParser.json());

queueRouter.route('/')
    .get((req, res) => {
        QueueModel.find({})
            .then((queues) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(queues);
            })
    })
    .post((req, res, next) => {
        if (req.body.discord_channel) {
            QueueModel.findOne({ discord_channel: req.body.discord_channel })
                .then((queue) => {
                    if (queue) {
                        MappingModel.deleteOne({ discord_channel: req.body.discord_channel })
                            .then(() => {
                                queue.discord_channel = null;
                                queue.save();
                            })
                    }
                })
                .then(() => {
                    QueueModel.create(req.body)
                        .then((queue) => {
                            MappingModel.create({ queueId: queue._id, discord_channel: queue.discord_channel })
                                .then(() => {
                                    console.log("Queue created");
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(queue);
                                }, (err) => next(err))
                        }, (err) => next(err))
                        .catch((err) => next(err));
                })
        }
        else {
            QueueModel.create(req.body)
                .then((queue) => {
                    console.log("Queue created");
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(queue);
                }, (err) => next(err))
                .catch((err) => next(err));
        }
    })
    .delete((req, res, next) => {
        QueueModel.deleteMany({})
            .then((resp) => {
                MappingModel.deleteMany({}).then(() => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(resp);
                }, (err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    })

queueRouter.route('/:queueId')
    .get((req, res, next) => {
        QueueModel.findById(req.params.queueId)
            .then((queue) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(queue);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        QueueModel.findById(req.params.queueId)
            .then((queueObj) => {
                queueObj.queue.push(req.body);
                queueObj.unpoppedItemsExist = true;
                queueObj.save()
                    .then((queueObj) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(queueObj);
                    }, (err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        QueueModel.deleteOne({ _id: req.params.queueId })
            .then((resp) => {
                MappingModel.deleteOne({ queueId: req.params.queueId })
                    .then(() => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(resp);
                    }, (err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    })

queueRouter.route('/:queueId/pop')
    .get((req, res, next) => {
        QueueModel.findById(req.params.queueId)
            .then((queueObj) => {
                var queue = queueObj.queue;
                var toPop = [];
                var flag1 = false;
                var flag2 = false;
                for (var i = 0; i < queue.length; i++) {
                    var item = queue[i]
                    if (item.popped == 1) {
                        toPop.push(item)
                        item.popped = 2
                        item.poppedTime2 = Math.round((new Date()).getTime() / 1000);
                        console.log("Using unix time.")
                        queueObj.currentItem = null;
                    }
                    if (!flag1 && !item.popped) {
                        queueObj.poppedOnce = true;
                        item.popped = 1;
                        item.poppedTime1 = Math.round((new Date()).getTime() / 1000);
                        queueObj.currentItem = item;
                        toReturn = item;
                        flag1 = true;
                        continue;
                    }
                    if (flag1 && !item.popped) {
                        flag2 = true;
                        queueObj.unpoppedItemsExist = true;
                        break;
                    }
                }
                if (!flag2) {
                    queueObj.unpoppedItemsExist = false;
                }
                queueObj.save()
                    .then((queueObj) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(queueObj);
                    })
            }, (err) => next(err))
            .catch((err) => next(err));
    })

queueRouter.route('/discord/:channelId')
    .get((req, res, next) => {
        MappingModel.findOne({ discord_channel: req.params.channelId })
            .then((mapping) => {
                if (mapping == null) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(null);
                }
                else{
                    QueueModel.findById(mapping.queueId)
                        .then((queueObj) => {
                            console.log("QueueObj:", queueObj);
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(queueObj);
                        })
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = queueRouter;