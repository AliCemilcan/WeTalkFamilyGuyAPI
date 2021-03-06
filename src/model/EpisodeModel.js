const mongoose = require('mongoose');

const EpisodeSchema = mongoose.Schema(
	{
		seasonNumber: {
			type: Number	
		},
		episodeNumber: {
			type: Number	
		},
		seasonEpisode: {
			type: 'String',
			required: true,
			unique: true
		},
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: false,
		},
		plot: {
			type: String,
		},
		image: {
			type: String
		},
		imDbRating: {
			type: String
		},
		imDbRatingCount: {
			type: String
		},
		year: {
			type: String	
		},
		released: {
			type: String
		},
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Posts',
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
		voteScore: { type: Number },
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

module.exports = mongoose.model('Episodes', EpisodeSchema);
