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
	if (existing_episode) {
		return res.status(400).json({ message: 'Episode Already Exist' });
	}
	const episode = await new Episodes({
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

	try {
		const savedEpisode = await episode.save();
		res.json(savedEpisode);
	} catch (err) {
		res.json({ message: err });
	}
});

// router.get('/', async (req, res) => {
// 	try {
// 		if (req.params.seasonNumber) {
// 			const seasonNumber = req.params.seasonNumber
// 			const episodes = await Episodes.find( { seasonNumber: seasonNumber });
// 			console.log("Episode Specific")
// 			res.json(episodes);
			
// 		} else {
// 			const episodes = await Episodes.find();
// 			console.log("Episode ALL")
// 			res.json(episodes);
// 		}
// 	} catch (err) {
// 		res.json({ message: err })
// 	}
// });
router.get('/episode-detail', async (req, res) => {
	try {
		if (req.query.seasonNumber && req.query.episodeNumber) {
			const seasonNumber = req.query.seasonNumber
			const episodeNumber = req.query.episodeNumber
			const episodes = await Episodes.find({ seasonNumber: seasonNumber, episodeNumber: episodeNumber }).populate({ 
				path: 'posts',
				populate: {
					path: 'comments',
					model: 'Comments'
				} 
			});
			// console.log(episodes)
			res.json({episodes : episodes});
			
		} else {
			const message= "Identify Episode and Season"
			res.json({ message: message });
		}
	} catch (err) {
		res.json({ message: err })
	}
});
router.get('/:seasonNumber', async (req, res) => {
	try {
		if (req.params.seasonNumber) {
			const seasonNumber = req.params.seasonNumber
			const episodes = await Episodes.find({ seasonNumber: seasonNumber }).sort({ episodeNumber: 1 });
			const episode_posts = await Post.find({seasonNumber: seasonNumber})
			// console.log(episodes)
			res.json({episodes : episodes, hot_topics: episode_posts});
			
		} else {
			const message= "Add Episode Number"
			res.json({ message: message });
		}
	} catch (err) {
		res.json({ message: err })
	}
});



module.exports = router