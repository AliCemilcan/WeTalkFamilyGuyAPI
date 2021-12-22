const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');
const { requestPasswordReset } = require('../utils/emailService');

const newToken = (user) => {
	return jwt.sign({ id: user.id }, process.env.SECRET, {
		expiresIn: '1800s',
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
		const savedUser = await user.save();
		const token = newToken(savedUser);
		const message = 'Welcome ' + req.body.username;
		return res.status(201).json({ token, savedUser, message });
	} catch (e) {
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
			googleID: req.body.googleID,
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
			const token = newToken(savedUser);
			const message = 'Welcome ' + req.body.username;
			
			return res.status(201).json({ token, savedUser, message });
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
			.select('userName password')
			.exec();

		if (!user) {
			return res.status(401).send(invalid);
		}

		const match = await user.checkPassword(req.body.password);

		if (!match) {
			return res.status(401).send(invalid);
		}

		const token = newToken(user);
		const message = 'Welcome ' + req.body.username;

		return res.status(201).send({ user, token, message });
	} catch (e) {
		console.error(e);
		res.status(500).end();
	}
};

const protect = async (req, res, next) => {
	const bearer = req.headers.authorization;

	console.log(bearer);
	if (!bearer || !bearer.startsWith('Bearer ')) {
		return res.status(401).end();
	}

	const token = bearer.split('Bearer ')[1].trim();
	console.log(token);
	let payload;
	try {
		payload = await verifyToken(token);
	} catch (e) {
		console.log('here?');
		return res.status(401).end();
	}

	const user = await User.findById(payload.id)
		.select('-password')
		.lean()
		.exec();

	if (!user) {
		return res.status(401).end();
	}

	req.user = user;
	next();
};

module.exports = {
	signin,
	signup,
	googleAuth,
	resetPasswordRequestController,
	protect,
};
