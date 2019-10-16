var mongoose = require ("mongoose");
var schema = mongoose.Schema;

var schemanote = new Schema({
    title: {
        type: String,
    },
    message: {
        type: String,
    }
});


var note = mongoose.model("note", schemanote);
module.exports = note;