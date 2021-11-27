const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var validateEmail = function (email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email)
};

const UserSchema = mongoose.Schema({
	userName: {
		type: String,
		required: true,
		unique: true
	},
  	email: {
  	    type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
	password: {
		type: String,
		required: true
	}
})

UserSchema.pre('save', function(next) {
	if (!this.isModified('password')) {
		return next();
	}

	bcrypt.hash(this.password, 8, (err, hash) => {
		if (err) {
			return next(err);
		}

		this.password = hash;
		next();
	});
});

UserSchema.methods.checkPassword = function(password) {
	const passwordHash = this.password;
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, passwordHash, (err, same) => {
			if (err) {
				return reject(err);
			}

			resolve(same);
		});
	});
};

module.exports = mongoose.model('Users', UserSchema)