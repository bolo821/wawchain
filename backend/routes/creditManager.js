const mongoose = require('mongoose');
const User = mongoose.model('User');

const depositeFromCancel = async (userId) => {
	const user = await User.find({_id: userId});
	if(!user.length){
		return {
			success: false,
			msg: 'No such user.',
		};
	} else {
		let userr = user[0];
		let query = {_id: userId};
		userr.credits = userr.credits + 10;
	
		const updateRes = await User.findOneAndUpdate(query, userr, {upsert: true});
		if (updateRes && updateRes.email) {
			return {
				success: true,
			};
		} else {
			return {
				success: false,
				msg: 'Internal server error.',
			}
		}
	}
}

module.exports = {
	depositeFromCancel,
}