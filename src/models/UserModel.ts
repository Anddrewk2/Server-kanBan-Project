/** @format */

import mongoose, { Schema } from 'mongoose';

const UserScheme = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	photoUrl: String,
	rule: {
		type: Number,
		default: 1,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
	address: String,
},
{ timestamps: true }
);

const UserModel = mongoose.model('users', UserScheme);
export default UserModel;
