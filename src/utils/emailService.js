const JWT = require('jsonwebtoken');
const User = require('../model/UserModel');
const Token = require('../model/TokenModel');

const sendEmail = require('../utils/email/sendEmail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.SECRET;
const clientURL = process.env.CLIENT_URL;

const requestPasswordReset = async function(email) {
	const user = await User.findOne({ email });
	if (!user) throw new Error('Email does not exist');

	//   let token = await Token.findOne({ userId: user._id });
	//   if (token) await token.deleteOne();

	let resetToken = crypto.randomBytes(32).toString('hex');
	const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

	await new Token({
		userId: user._id,
		token: hash,
		createdAt: Date.now(),
	}).save();
	const link = `http://localhost:8080/forgot-password?token=${resetToken}&id=${user._id}`;
	sendEmail(
		user.email,
		'Password Reset Request',
		{
			name: user.userName,
			link: link,
		},
		'./requestResetPassword.handlebars'
	);
	return link;
};
const welcomeUserEmail = async function(email) {
	const user = await User.findOne({ email });
	if (!user) throw new Error('Email does not exist');

	//   let token = await Token.findOne({ userId: user._id });
	//   if (token) await token.deleteOne();

	sendEmail(
		user.email,
		'Welcome to WeTalkFamilyGuy',
		{
			name: user.userName,
		},
		'./welcomeEmail.handlebars'
	);
	return true;
};

const resetPassword = async (userId, token, password) => {
	let passwordResetToken = await Token.findOne({ userId });

	if (!passwordResetToken) {
		throw new Error('Invalid or expired password reset token');
	}

	const isValid = await bcrypt.compare(token, passwordResetToken.token);

	if (!isValid) {
		throw new Error('Invalid or expired password reset token');
	}

	const hash = await bcrypt.hash(password, Number(bcryptSalt));

	await User.updateOne(
		{ _id: userId },
		{ $set: { password: hash } },
		{ new: false }
	);

	const user = await User.findById({ _id: userId });

	sendEmail(
		user.email,
		'Password Reset Successfully',
		{
			name: user.name,
		},
		'./resetPassword.handlebars'
	);

	await passwordResetToken.deleteOne();

	return true;
};


module.exports = {
	requestPasswordReset,
	resetPassword,
	welcomeUserEmail
};
