const express = require('express');

const router = express.Router();
const Comment = require('../model/CommentModel');
const Episodes = require('../model/EpisodeModel');
const Post = require('../model/PostModel');

const createEpisode = function (episode, post_id) {
	console.log(comment)
	return Episodes.create(episode).then(docComment => {
		console.log(docComment._id)
		res.json(savedComment);
		// return Post.findByIdAndUpdate(
		// 	{ _id: post_id },
		// 	{
		// 		$push: { comments: docComment._id },
		// 	},
		// 	{ new: true, useFindAndModify: false }
		// );
	})

}

router.post('/', async (req, res) => {
	const existing_episode = await Episodes.exists({
		seasonEpisode: req.body.seasonEpisode,
	});
	if (existing_episode ) {
		return res.status(400).json({ message: 'Episode Already Exist' });
	}
	const episode = new Episodes({
		title: req.body.title,
		plot:req.body.plot,
		seasonNumber:req.body.seasonNumber,
		episodeNumber:req.body.episodeNumber,
		seasonEpisode:req.body.seasonEpisode,
		image:req.body.image,
		imDbRating:req.body.imDbRating,
		imDbRatingCount:req.body.imDbRatingCount,
		year:req.body.year,
		released:req.body.released,
	});

	console.log("?????")
	try {
		const savedEpisode = await episode.save();
		console.log("succccess")
		res.json(savedEpisode);
		console.log(savedEpisode)
	} catch (err) {
		res.json({ message: err });
	}
});

router.get('/', async (req, res) => {
	try {
		const episodes = await Episodes.find();
		console.log("Episode ALL", episodes)
		res.json(episodes);
	} catch (err) {
		res.json({ message: err })
	}
});

module.exports = router