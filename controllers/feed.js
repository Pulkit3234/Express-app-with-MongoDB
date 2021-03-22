const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');

exports.getPosts = async (req, res, next) => {
	const currentpage = req.query.page || 1;
	const perPage = 2;
	let totalItems;

	try {
		let count = await Post.find().countDocuments();
		totalItems = count;
		const posts = await Post.find()
			.skip((currentpage - 1) * perPage)
			.limit(perPage);
		return res.status(200).json({ message: 'Fetched Posts Succesfully', posts, totalItems });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
			next(e);
		}
	}
	/*Post.find()
		.then((posts) => {
			if (!posts) {
				const error = new Error('Something went wrong');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: 'Posts Fetched', posts }); // post: post === post
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}); // mongoose converts it into objectId on its own. */
};

exports.createPost = async (req, res, next) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		const error = new Error('Validation Failed, entered data is incorrect');
		error.statusCode = 422;
		throw error;
	}

	if (!req.file) {
		const error = new Error('Image not provided');
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	const imageUrl = req.file.path.replace('\\', '/');
	const post = new Post({
		title,
		content,
		creator: {
			name: 'maximilian',
		},
		imageUrl,
	});

	try {
		const result = await post.save();
		console.log(result);
		res.status(201).json({
			message: 'Post created successfully!',
			post: result,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}

	// Create post in db
};

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('Something went wrong');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({ message: 'Posts Fetched', post }); // post: post === post
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}); // mongoose converts it into objectId on its own.
};

exports.updatePost = async (req, res, next) => {
	const postId = req.params.postId;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, incorrect data entered');
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	const imageUrl = req.body.imageUrl.replace('\\', '/');
	if (req.file) {
		imageUrl = req.file.path.replace('\\', '/');
	}
	if (!imageUrl) {
		const error = new Error('No file Picked');
		error.statusCode = 422;
		throw error;
	}

	try {
		const post = await Post.findById(postId);
		if (!post) {
			const error = new Error('Post Not Found');
			error.statusCode = 404;
			throw error; //using this automatically function execution will stop.
		}

		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl);
		}
		post.title = title;
		post.content = content;
		post.imageUrl = imageUrl;
		const result = await post.save();
		return res.status(200).json({ message: 'Post Updated', post: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(e);
	}
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error('post not found');
				error.statusCode = 404;
				throw error;
			}

			clearImage(post.imageUrl);
			return Post.findByIdAndRemove(postId);
		})
		.then((result) => {
			console.log(result);
			res.status(200).json({ message: 'delete post' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
