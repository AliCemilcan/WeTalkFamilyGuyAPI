const mongoose = require('mongoose');

const EpisodeSchema = mongoose.Schema(
	{
	title: {
        type: String,
        required: true,
    },
	content: {
        type: String,
        required: true,
    },
	posts: [
		{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
      }
	]
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

module.exports = mongoose.model('Episodes', EpisodeSchema);