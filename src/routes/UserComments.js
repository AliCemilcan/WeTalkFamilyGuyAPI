const express = require('express');

const router = express.Router();
const Comment = require('../model/CommentModel');
const Post = require('../model/PostModel');
const User = require('../model/UserModel');

const createComment = function (comment, post_id) {
//	console.log(comment)
	return Comment.create(comment).then(docComment => {
	//	console.log(docComment._id)
		return Post.findByIdAndUpdate(
			{ _id: post_id },
			{
				$push: { comments: docComment._id },
			},
			{ new: true, useFindAndModify: false }
		);
	})

}

router.post('/', async (req, res) => {
	var user = null
	try {
		try {
			user = await User.findOne({ _id: req.body.createdBy })
		} catch (err) {
			res.status(401).json({ message: 'User Not Found' });
			return
		}
		console.log(user)
		const comment = new Comment({
			text: req.body.text,
			createdBy: req.body.createdBy,
			postID: req.body.postID,
			userName: user.userName
		})
		console.log(comment)
		
		const savedComment = await createComment(comment, req.body.postID);
		res.status(201).json({ message:'Got your comment!' });
			
	} catch (err) {
		console.log(err)
		res.status(401).json({ message: 'Error Creating Comment' });
	}
	
});

router.get('/', async (req, res) => {
	console.log("??????????")
	try {
		const coments = await Comment.find();
		res.json(coments);
	} catch (err) {
		res.json({ message: err })
	}
});

module.exports = router