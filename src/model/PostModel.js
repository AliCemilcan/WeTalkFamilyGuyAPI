const mongoose = require('mongoose');

const PostSchema = mongoose.Schema(
	{
		title: String,
		createdBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'Users',
			required: true,
		},
		userName: {
			type: String,
			required: true,
		},
		content: String,
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comments',
			},
		],
		upVotes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				unique: true,
				ref: 'Users',
			},
		],
		downVotes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				unique: true,
				ref: 'Users',
			},
		],
		savedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				unique: true,
				ref: 'Users',
			},
		],
		voteScore: { type: Number },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

module.exports = mongoose.model('Posts', PostSchema);
