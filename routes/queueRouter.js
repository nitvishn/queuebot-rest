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
        QueueModel.create(req.body)
            .then((queue) => {
                console.log("Queue created");
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(queue);
            }, (err) => next(err))
            .catch((err) => next(err));
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
            .then((queue) => {
                queue.queue.push(req.body);
                queue.save()
                    .then((queue) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(queue);
                    }, (err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        QueueModel.deleteOne({_id: req.params.queueId})
        .then((resp) => {
            MappingModel.deleteOne({queueId: req.params.queueId})
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
                        item.poppedTime2 = item.poppedTime2
                    }
                    if (!flag1 && !item.popped) {
                        queueObj.poppedOnce = true;
                        item.popped = 1;
                        item.poppedTime1 = item.createdAt;
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
                    queueObj.currentItem = null;
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

module.exports = queueRouter;