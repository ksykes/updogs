const mongoose = require('mongoose');
const Schema = mongoose.Schema; // capital typically means it's a constructor and later we will need to use the "new" keyword to construct a new component

const petSchema = new Schema({
	name: String,
	photo: String,
	description: {
		type: String,
		default: ""
	},
	score: {
		type: Number,
		default: 0
	}
});

// Connects to plural of "pet" collection in MongoDB
module.exports = mongoose.model('Pet', petSchema);
