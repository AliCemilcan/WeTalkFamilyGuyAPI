const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./src/utils/auth');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');


const app = express();
require('dotenv/config');
//you have ability to create routes

app.use(cors());
app.use(compression());
app.use(helmet());
app.options('*', cors())

//MiddleWare
const userPosts = require('./src/routes/UserPosts')
const userComment = require('./src/routes/UserComments')
const episode = require('./src/routes/Episodes')
const season = require('./src/routes/Season')

// converting json
app.use(bodyParser.json());
app.use('/checkAuth', auth.protect);
app.use('/posts', userPosts);
app.use('/comment', userComment);
app.use('/episodes', episode);
app.use('/season', season);
app.use('/signup', auth.signup);
app.use('/signin', auth.signin);
app.use('/googleAuth', auth.googleAuth);
app.use("/requestResetPassword", auth.resetPasswordRequestController);





// app.use('/posts', () => {
// 	console.log('this is middlewre running')
// })




//routes
app.get('/', (req, res) => {
	res.send('We are on home')
})
app.get('/post', (req, res) => {
	res.send('We are on post')
})

const connect = () => {
	return mongoose.connect(process.env.DB_CONNECTION, () => {
		console.log('connected to DB')
	})
}
connect()
//start listening the server
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});