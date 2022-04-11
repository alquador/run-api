const mongoose = require('mongoose')

const runSchema = new mongoose.Schema(
	{
		description: {
			type: String,
		},
		mileage: {
			type: Number
		},
		date: {
			type: Date
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Run', runSchema)
