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
	const user = await User.findOne({ _id: req.body.createdBy })
	const comment = new Comment({
		text: req.body.text,
		createdBy: req.body.createdBy,
		postID: req.body.postID,
		userName: user.userName
	});
	//const user = await User.findOne({ _id: req.body.createdBy })
//	const current_user = User.find({ _id: (req.body.createdBy) }, {_id: 0, userName: 1})
	console.log(user)

	try {
		const savedComment = await createComment(comment, req.body.postID);
		res.json({savedComment, user});
	} catch (err) {
		res.json({ message: err });
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