const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mappingSchema = new Schema({
    queueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue',
        unique: true
    },
    discord_channel: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
})

var MappingModel = mongoose.model("Mapping", mappingSchema);
module.exports = MappingModel;