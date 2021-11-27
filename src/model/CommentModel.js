const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema(
	{
		text: {
			type: String,
			required: true,
		},
		createdBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'Users',
			required: true,
		},
		userName: { 
			type: String,
			required: true,
		}
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

module.exports = mongoose.model('Comments', CommentSchema);