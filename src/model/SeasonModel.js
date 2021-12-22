const mongoose = require('mongoose');

const EpisodeSchema = mongoose.Schema(
	{
		seasonNumber: {
			type: String,
			unique: true
		},
		content: {
			type: String,
		},
		episodes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Episodes',
			},
		],
		year: { 
			type: String
		},
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

module.exports = mongoose.model('Seasons', EpisodeSchema);
