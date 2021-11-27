const express = require('express')

const router = express.Router();
const Post = require('../model/PostModel');
const Episode = require('../model/EpisodeModel');

router.get('/', async (req, res) => {

	try {
		const posts = await Post.find().populate('comments')
		res.json(posts)
	} catch(err) {
		res.json({message: err})
	}
	
});

router.get('/ID', (req, res) => {
	res.send('We are on post ID')
});

router.post('/', async (req, res) => {
	const user = await User.findOne({ _id: req.body.createdBy })
	const post = new Post({
		title: req.body.title,
		content: req.body.content,
		createdBy: req.body.createdBy,
		episodeID: req.body.episodeID,
		userName: user.userName
	});

	try {

		const savedPost = await createPost(post, req.body.episodeID)
		res.json(savedPost);
	} catch (err) {
		res.json({message: err})
	}
	
});

const createPost = function (post, episode_id) {
	return Post.create(post).then(docComment => {
		return Episode.findByIdAndUpdate(
			{ _id: episode_id },
			{
				$push: { posts: docComment._id },
			},
			{ new: true, useFindAndModify: false }
		);
	})

}

module.exports = router

