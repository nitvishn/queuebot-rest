const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    discord_user: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        required: true,
    },
    numQuestions: {
        type: Number,
        required: true
    },
    comments: {
        type: String,
        default: ""
    },
    popped: {
        type: Number, 
        default: 0
    }
}, {
    timestamps: true
})

const queueSchema = new Schema({
    discord_channel: {
        type: String,
        default: null
    },
    title: {
        type: String,
        default: "Untitled Queue"
    },
    queue: [itemSchema],
    poppedOnce: {
        type: Boolean,
        default: false
    },
    unpoppedItemsExist: {
        type: Boolean,
        default: true
    },
    currentItem: itemSchema
});

var QueueModel = mongoose.model("Queue", queueSchema);
module.exports = QueueModel;