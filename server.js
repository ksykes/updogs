const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const Pet = require('./models/pet.js');
const bodyParser = require('body-parser');

// Telling it to connect to updog MongoDB database
const DBURL = process.env.MONGODB_URI || 'mongodb://localhost/updog';
mongoose.connect(DBURL);
// mongoose.connect('mongodb://localhost/updog');

const port = process.env.PORT || 8080;

app.use(express.static('public'));

app.use(bodyParser.json());

router.route('/')
	.get((req, res) => {
		res.send({
			message: "What's updog?"
		});
	});

router.route('/pets')
	.get((req, res) => {
		// Get all the pets
		const query = req.query;
		const pet = Pet.find(); // Starting a find request that hasn't been executed yet (executes on .exec method)

		if(query.order_by === 'score') {
			pet.sort({
				score: -1
			});
		}

		pet.exec((err, docs) => {
			// callback function
			if(err !== null) {
				res.status(400)
					.send({
						error: err
					});
				return;
			}
			res.status(200)
				.send(docs);
		});
	})
	.post((req, res) => {
		// req is request user has just made to server
		const body = req.body;
		const pet = new Pet(body);

		// Writes it to the database, like using insert in MongoDB (.save is part of Mongoose)
		pet.save((err, doc) => {
			if (err !== null) {
				res.status(400)
					.send({
						error: err
					});
				return;
			}
			res.status(200)
				.send(doc);
		});
	});

// Find pet by ID
router.route('/pets/:pet_id')
	.get((req, res) => {
		const params = req.params;
		Pet.findOne({_id: params.pet_id}, (err, doc) => {
			if (err !== null) {
				res.status(400)
					.send({
						error: err
					});
				return;
			}
			res.status(200)
				.send(doc);
		});
	})
	.put((req, res) => {
		Pet.findById(req.params.pet_id, (err, doc) => {
			if (err !== null) {
				res.status(400)
					.send({
						error: err
					})
				return;
			}
			// Merge the original document/body and what we want to send (doc is a full document, req.body could be a document of one field)
			// Take current score and add one to it
			Object.assign(doc, req.body, {score: doc.score += 1});

			doc.save((err, savedDoc) => {
				if (err !== null) {
					res.status(400)
						.send({
							error: err
						})
					return;
				}
				res.status(200)
					.send(savedDoc);
			});
		});
	})
	.delete((req, res) => {
		Pet.findByIdAndRemove(req.params.pet_id, (err, doc) => {
			if (err !== null) {
				res.status(400)
					.send({
						error: err
					});
				return;
			}
			// res.status(204);
			res.status(200)
				.send({
					success: 'Item deleted.'
				});
		});
	});

// app.get('/', (req, res) => {
// 	res.send({
// 		message: 'You got it!'
// 	});
// });

app.use('/api', router);

app.listen(port);
