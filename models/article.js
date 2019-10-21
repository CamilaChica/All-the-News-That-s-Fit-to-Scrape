var mongoose = require ("mongoose");
var schema = mongoose.Schema;

var schemaarticle = new schema({
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
		default: "Summary unavailable."
	},
	img: {
		type: String,
		// default: "/assets/images/unavailable.jpg"
	},
	issaved: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: "Save Article"
	},
	created: {
		type: Date,
		default: Date.now
	},
	note: {
		type: schema.Types.ObjectId,
		ref: "Note"
	}
});

schemaarticle.index({title: "text"});

var article = mongoose.model("article", schemaarticle);
module.exports = article;