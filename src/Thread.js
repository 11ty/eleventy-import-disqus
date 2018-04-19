const { URL } = require("url");

class Thread {
	constructor(threadObj) {
		this.threadId = threadObj.$['dsq:id'];
		this.thread = threadObj;
		this.url = new URL(threadObj.link[0]);
		this.path = this.url.pathname;
		this.posts = [];
	}

	getThreadId() {
		return this.threadId;
	}

	getPath() {
		return this.path;
	}

	getParentPostById(postId) {
		for(let post of this.posts) {
			if( post.getPostId() === postId ) {
				return post;
			}
		}
	}

	addPost(postInstance) {
		let parentPostId = postInstance.getParentPostId();
		if( parentPostId ) {
			let parentPostInstance = this.getParentPostById(parentPostId);
			if( !parentPostInstance ) {
				throw new Error(`Could not find parent post for ${parentPostId}`);
			}

			parentPostInstance.addReply(postInstance);
		}

		this.posts.push(postInstance);
	}

	getCount() {
		return this.posts.length;
	}

	isEmpty() {
		return this.posts.length === 0;
	}

	toObject() {
		return {
			// threadId: this.threadId,
			// date: this.thread.createdAt[0],
			// url: this.url.href,
			path: this.path,
			commentCount: this.posts.length,
			// title: this.thread.title[0],
			// message: this.thread.message[0],
			comments: this.posts.filter(post => {
				return !post.getParentPostId();
			}).map(post => {
				return post.toObject();
			})
		};
	}
}

/*
{ '$': { 'dsq:id': '1268213762' },
  id: [ '' ],
  forum: [ 'web367' ],
  category: [ { '$': [Object] } ],
  link: [ 'https://www.zachleat.com/web/conservative-design-patterns-for-form-elements/' ],
  title: [ 'Conservative Design Patterns for Form Elements' ],
  message: [ '' ],
  createdAt: [ '2007-02-23T08:26:29Z' ],
  author:
   [ { email: [Array],
       name: [Array],
       isAnonymous: [Array],
       username: [Array] } ],
  ipAddress: [ '127.0.0.1' ],
  isClosed: [ 'false' ],
  isDeleted: [ 'false' ] } */

module.exports = Thread;