const express = require('express');
const bodyParser = require('body-parser');
var QueueModel = require("../models/queueModel");

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
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
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

queueRouter.route('/:queueId/pop')
    .get((req, res, next) => {
        QueueModel.findById(req.params.queueId)
            .then((queueObj) => {
                var queue = queueObj.queue;
                var toPop = [];
                for(var i = 0; i < queue.length; i++){
                    if(queue[i].popped == 1){
                        toPop.push()
                    }
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(queue);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = queueRouter;