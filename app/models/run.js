const mongoose = require('mongoose')

const runSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
		},
		mileage: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Run', runSchema)
