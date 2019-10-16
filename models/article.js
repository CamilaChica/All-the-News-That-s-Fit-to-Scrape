var mongoose = require ("mongoose");
var schema = mongoose.Schema;

var schemaarticle = new Schema({
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        default: "Summary is not currently available"
    },
    image: {
        type: String,
    },
    saved: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: "Article saved!"
    },
    created: {
        type: Date,
        default: Date.now
    },
    note: {
        type: Schema.Type.ObjectId,
        ref: "Note"
    }
});

schemaarticle.index({title: "text"});

var article = mongoose.model("article", schemaarticle);
module.exports = article;