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
	var user = null
	try {
		try {
			 user = await User.findOne({ _id: req.body.createdBy });
			
		} catch (err) {
			res.status(401).json({ message: 'User Not Found' });
			
		}
		const post = new Post({
			title: req.body.title,
			content: req.body.content,
			createdBy: req.body.createdBy.toString(),
			episodeID: req.body.episodeID,
			userName: user.userName,
			upVotes: [req.body.createdBy],
			downVotes: [],
			savedBy:[],
			voteScore: 0,
		});
		// const createdPost = Post.create(post).then(docComment => {
		// 	console.log("doccccccc", docComment)
		// }).catch(e => {
		// 	console.log("ERROR", e)
		// })
		//console.log(post, "created post", createdPost)
		const savedPost = await createPost(post, req.body.episodeID);
		res.json(savedPost);

	} catch (err) {
		res.status(401).json({ message: err });
	}
});

//Upvote
router.post('/vote-up', async (req, res) => {
	if (!req.body.user || !req.body.id) {
		return res.status(400).send({ message: 'UnAutharized' });
	}

	try {
		const upvote_status = await Post.updateOne(
			{ _id: req.body.id },
			{
				$addToSet: { upVotes: req.body.user },
			},
			{ upsert: false }
			
		)
		console.log(upvote_status)
		const message = 'Post Upvoted!';
		return res.status(200).send({ message });
		
	} catch (err) {
		res.json({ message: err });
	}
});

router.post('/save-post', async (req, res) => {

	try {
		await User.findByIdAndUpdate(
			{ _id: req.body.user },
			{
				$push: { savedPosts: req.body.post },
			},
			{ new: true, useFindAndModify: false }
		).then(async (data) => { 
			try {
			
				await Post.updateOne(
					{ _id: req.body.post },
					{
						$addToSet: { savedBy: req.body.user },
					},
					{ upsert: false }
			
				).then(data => {
					const message = 'Saved!';
					return res.status(200).send({ message });
				});
			} catch (err) {
				const message = 'Something went wrong!!';
				return res.status(401).send({ message });
			}
		});
	} catch (err) {
		res.json({ message: err });
	}
});
router.post('/:id/vote-down', async (req, res) => {
	if (!req.body.user || !req.body.id) {
		return res.status(400).send({ message: 'UnAutharized' });
	}
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
router.post('/user-saved-posts', async (req, res) => {
	if (!req.body.id) {
		console.log("REQUEST", req.body.id)

		return res.status(400).send({ message: 'UnAutharized' });
	}
	try {
		const saved_posts = await Post.find(
			{_id:{$in:req.body.posts}}
			
		)
		return res.status(200).send({ saved_posts: saved_posts });

	} catch (err) {
		res.json({ message: err });
	}
});

const createPost = function(post, episode_id) {
	return Post.create(post).then((docComment) => {
		console.log("POST CREAYED", docComment)
		return Episode.findByIdAndUpdate(
			{ _id: episode_id },
			{
				$push: { posts: docComment._id },
			},
			{ new: true, useFindAndModify: false }
		);
	})
};

module.exports = router;
