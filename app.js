const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const path = require('path');

const feedRoutes = require('./routes/feed');

const multer = require('multer');

const { v4: uuidv4 } = require('uuid');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>

mongoose
	.connect('mongodb+srv://username:new@cluster0.6zk4z.mongodb.net/messages?retryWrites=true&w=majority', {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
	})
	.then((result) => app.listen(8080))
	.catch((err) => console.log(err));

app.use(express.json()); // application/json
app.use('/images', express.static(path.join(__dirname, 'images')));

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		const extension = file.mimetype.slice(6, file.mimetype.length);
		cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	res.status(status).json({ message }); // this acts as res.status().send();
});

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/feed', feedRoutes);


