const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');
const bcrypt = require('bcrypt');
const { requestPasswordReset,welcomeUserEmail } = require('../utils/emailService');

const newToken = (user) => {
	return jwt.sign({ user_id: user._id.toString() }, process.env.SECRET, {
		expiresIn: '10h',
	});
};

const verifyToken = (token) =>
	new Promise((resolve, reject) => {
		jwt.verify(token, process.env.SECRET, (err, payload) => {
			if (err) return reject(err);
			resolve(payload);
		});
	});

const signup = async (req, res) => {
	if (!req.body.username || !req.body.password || !req.body.email) {
		return res.status(400).send({ message: 'need email and password' });
	}
	try {
		const existing_user = await User.exists({
			userName: req.body.username,
		});
		const existing_user_email = await User.exists({
			email: req.body.email,
		});
		console.log(existing_user);

		if (existing_user || existing_user_email) {
			return res.status(400).json({ message: 'User Already Exist' });
		}
		const user = new User({
			userName: req.body.username,
			email: req.body.email,
			password: req.body.password,
		});
		console.log("New User", user);

		const savedUser = await user.save();
		console.log("Saved User", user);

		const token = newToken(savedUser);
		const requestWelcomeEmail= await welcomeUserEmail(
				req.body.email
			);
		const message = 'Welcome ' + req.body.username;
		return res.status(201).json({ token, savedUser, message });
	} catch (e) {
		console.log(e)
		const message = 'Sorry.. Something went wrong';

		return res
			.status(500)
			.json({ message })
			.end();
	}
};
const googleAuth = async (req, res) => {
	if (!req.body.username || !req.body.googleID || !req.body.email) {
		return res.status(400).send({ message: 'credentials not verified..' });
	}
	try {
		const existing_user = await User.exists({
			userName: req.body.username,
		});
		if (existing_user) {
			const user = await User.findOne({ userName: req.body.username })
				.select('userName')
				.exec();
			const token = newToken(user);
			const message = 'Welcome ' + req.body.username;
			return res.status(201).send({ user, token, message });
		} else {
			const user = new User({
				userName: req.body.username,
				email: req.body.email,
				googleID: req.body.googleID,
				profileImage: req.body.profileImage,
			});
			const savedUser = await user.save();
			const requestWelcomeEmail= await welcomeUserEmail(
				req.body.email
			);
			const token = newToken(savedUser);
			
			const message = 'Welcome ' + req.body.username;
			
			return res.status(201).json({ savedUser,token, message });
		}
	} catch (e) {
		console.log(e);
		const message = 'Sorry.. Something went wrong';

		return res
			.status(500)
			.json({ message })
			.end();
	}
};
const resetPasswordRequestController = async (req, res) => {
	try {
		const requestPasswordResetService = await requestPasswordReset(
			req.body.email
		);
		const message = 'Password Reset Link Available ';
		return res.status(201).json({ url: requestPasswordResetService, message });
	} catch (e) {
		var message = 'Sorry.. Something went wrong';
		return res
			.status(500)
			.json({ message })
			.end();
	}
};

const signin = async (req, res) => {
	if (!req.body.username || !req.body.password) {
		return res.status(400).send({ message: 'need email and password' });
	}

	const invalid = { message: 'Invalid email and passoword combination' };

	try {
		const user = await User.findOne({
			$or: [
				{ email: req.body.username },
				{ userName: req.body.username },
			],
		})
			.select('userName password email')
			.exec();

		if (!user) {
			return res.status(401).send(invalid);
		}

		const match = await user.checkPassword(req.body.password);

		if (!match) {
			return res.status(401).send(invalid);
		}
		const requestWelcomeEmail= await welcomeUserEmail(
				user.email
			);
		const token = newToken(user);
		const message = 'Welcome ' + req.body.username;

		return res.status(201).send({ user, token, message });
	} catch (e) {
		console.error(e);
		res.status(500).end();
	}
};
const forgotPassword = async (req, res) => {
	if (!req.body.token || !req.body.password) {
		return res.status(400).send({ message: 'need token and password' });
	}
	const token = req.body.token.replace(/^Bearer\s+/, "").trim();
	let payload;
	try {
		payload = await verifyToken(token);
	} catch (e) {
		return res.status(401).send({ message: 'Session expired' });
	}
	try {	
		let hash = await bcrypt.hash(req.body.password, 8)
		await User.updateOne(
			{ _id: payload.user_id },
			{ $set: { password: hash } },
			{ new: false }
		);
		return res.status(201).send({ message: 'Password Changed'});
		
	} catch (err) {
		return res.status(401).send({message: 'Cannot Change your credentials'});
	}

};
const changeEmail = async (req, res) => {
	try {
		const user = await User.findOne({
			$or: [
				{ email: req.body.username },
				{ userName: req.body.username },
			],
		})
			.select('userName password email')
			.exec();
		if (!user) {
			return res.status(401).send({message: 'User Not Found'});
		}
		const match = await user.checkPassword(req.body.password);

		if (!match) {
			return res.status(401).send({message: 'User Password Not Correct'});
		}
		let hash = await bcrypt.hash(req.body.new_password, 8)
		if (req.body.new_password && req.body.new_email) {

			await User.updateOne(
				{ _id: req.body.user_id },
				{ $set: { email: req.body.new_email, password:  hash } },
				{ new: false }
			);
			return res.status(201).send({ message: 'Email & Password Changed'});
			
		} else if(req.body.new_password){
			await User.updateOne(
				{ _id: req.body.user_id },
				{ $set: { password: hash } },
				{ new: false }
			);
			return res.status(201).send({ message: 'Password Changed'});
		} else {
				await User.updateOne(
				{ _id: req.body.user_id },
				{ $set: { email: req.body.new_email } },
				{ new: false }
			);
			return res.status(201).send({ message: 'Email Changed'});
		}

	} catch (e) {
		return res.status(401).send({message: 'Cannot Change your credentials'});
	}
};

const protect = async (req, res, next) => {
	const bearer = req.headers.authorization;

	if (!bearer || !bearer.startsWith('Bearer ')) {
		return res.status(401).send({message: 'Session expired'});
	}
	const token = bearer.replace(/^Bearer\s+/, "").trim();
	let payload;
	try {
		payload = await verifyToken(token);
	} catch (e) {
		return res.status(401).send({message: 'Session expired'});
	}
	const user = await User.findById(payload.user_id)
		.select('-password')
		.exec();
	if (!user) {
		return res.status(401).send({message: 'Session expired'});
	} else {
		return res.status(201).send({ user, token});
	}
	// req.user = user;
	// next();
};





module.exports = {
	signin,
	signup,
	googleAuth,
	resetPasswordRequestController,
	changeEmail,
	forgotPassword,
	protect
};
