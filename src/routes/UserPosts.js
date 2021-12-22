const express = require('express');

const router = express.Router();
const Post = require('../model/PostModel');
const Episode = require('../model/EpisodeModel');
const User = require('../model/UserModel');

router.get('/', async (req, res) => {
	try {
		const posts = await Post.find().populate('comments').populate('createdBy','userName');
		res.json(posts);
	} catch (err) {
		res.json({ message: err });
	}
});

router.get('/ID', (req, res) => {
	res.send('We are on post ID');
});

router.post('/', async (req, res) => {
	const user = await User.findOne({ _id: req.body.createdBy });
	const post = new Post({
		title: req.body.title,
		content: req.body.content,
		createdBy: req.body.createdBy,
		episodeID: req.body.episodeID,
		userName: user.userName,
		upVotes: [],
		downVotes: [],
		vodeScore: 0,
	});

	try {
		const savedPost = await createPost(post, req.body.episodeID);
		res.json(savedPost);
	} catch (err) {
		res.json({ message: err });
	}
});

//Upvote
router.post('/:id/vote-up', async (req, res) => {

	try {
		 await Post.updateOne(
			{ _id: req.body.id },
			{
				$addToSet: { upVotes: req.body.user_id },
			},
			{ upsert: true }
			
		 ).then(data => {
			const message = 'Downvoted';
			return res.status(200).send({ message });
		});
	} catch (err) {
		res.json({ message: err });
	}
});

router.post('/:id/vote-down', async (req, res) => {

	try {
		 await Post.updateOne(
			{ _id: req.body.id },
			{
				$addToSet: { downVotes: req.body.user_id },
			},
			{ upsert: true }
			
		).then(data => {
			const message = 'Downvoted';
			return res.status(200).send({ message });
		});
	} catch (err) {
		res.json({ message: err });
	}
});

const createPost = function(post, episode_id) {
	return Post.create(post).then((docComment) => {
		return Episode.findByIdAndUpdate(
			{ _id: episode_id },
			{
				$push: { posts: docComment._id },
			},
			{ new: true, useFindAndModify: false }
		);
	});
};

module.exports = router;
