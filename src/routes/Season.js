const express = require('express');

const router = express.Router();
const Season = require('../model/SeasonModel');

router.post('/', async (req, res) => {

	const season = new Season({
		seasonNumber: req.body.season_no,
		year: req.body.year,
	});
	console.log(season)

	try {
		const savedEpisode = await season.save();
		console.log(savedEpisode)
		res.json(savedEpisode);
		console.log(savedEpisode);
	} catch (err) {
		res.json({ message: err });
	}
	
});

router.get('/', async (req, res) => {
	try {
		const all_season = await Season.find();
		res.json(all_season);
	} catch (err) {
		res.json({ message: err });
	}
});

module.exports = router;
