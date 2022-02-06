const express = require('express');

const router = express.Router();
const Comment = require('../model/CommentModel');
const Post = require('../model/PostModel');
const User = require('../model/UserModel');

const createComment = async function (comment, post_id) {
	return Comment.create(comment).then(docComment => {
		return Post.findByIdAndUpdate(
			{ _id: post_id },
			{
				$push: { comments: docComment._id },
			},
			{ new: true, useFindAndModify: false }
		);
	})

}
const insertChildComment = async function (comment, post_id) {
	return Comment.findByIdAndUpdate(
		{ _id: post_id },
		{
			$push: { childComments: comment._id },
		},
		{
			new: true,
			useFindAndModify: false
		}
	);
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
		let comment_to_insert = {
			text: req.body.text,
			createdBy: req.body.createdBy,
			userName: user.userName
		}
		if (req.body.postID) {
			comment_to_insert.postID = req.body.postID
		}
		if (req.body.parentID) {
			comment_to_insert.parentID = req.body.parentID
		}
		const comment = new Comment(comment_to_insert)
		
		const savedComment = await createComment(comment, req.body.postID || req.body.parentID);
		if (req.body.parentID) {
			const insertComment = await insertChildComment(comment, req.body.parentID);

		}
		res.status(201).json({ message:'Got your comment!' });
			
	} catch (err) {
		console.log(err)
		res.status(401).json({ message: 'Error Creating Comment' });
	}
	
});

router.get('/:commentID', async (req, res) => {
	try {
		if (req.params.commentID) {
			const childComments = await Comment.findOne({ _id: req.params.commentID }).populate({
				path: 'childComments'
			})
			res.json({child_comments : childComments});
			
		} else {
			res.status(401).json({ message: 'Error Creating Comment' });

		}
	} catch (err) {
		res.status(401).json({ message: 'Error Creating Comment' });

	}
});

module.exports = router