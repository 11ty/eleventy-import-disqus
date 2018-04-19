const md5 = require("md5");

class Post {
	constructor(postObj) {
		this.threadId = postObj.thread[0].$["dsq:id"];
		this.post = postObj;
		this.postId = postObj.$["dsq:id"];
		this.parentPostId = postObj.parent ? postObj.parent[0].$["dsq:id"] : null;
		this.replies = [];
	}

	addReply(postInstance) {
		this.replies.push(postInstance);
	}

	getThreadId() {
		return this.threadId;
	}

	getPostId() {
		return this.postId;
	}

	getParentPostId() {
		return this.parentPostId;
	}

	getGravatarUrl(email) {
		return `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?d=mm&s=60`;
	}

	toObject() {
		return {
			// threadId: this.threadId,
			postId: this.postId,
			parentPostId: this.parentPostId,
			date: this.post.createdAt[0],
			author: this.post.author[0].name[0],
			avatar: this.getGravatarUrl(this.post.author[0].email[0]),
			message: this.post.message[0],
			replies: this.replies.map(function(reply) {
				return reply.toObject()
			})
		};
	}
}

/*
{ '$': { 'dsq:id': '887461485' },
  id: [ 'wp_id=10' ],
  message: [ '<p>You\'re right -- this is a bug.  We\'re working on it and plan to have a fix in an upcoming patch early in April.  Regards, Eric (YUI Team)</p>' ],
  createdAt: [ '2007-03-23T23:52:26Z' ],
  isDeleted: [ 'false' ],
  isSpam: [ 'false' ],
  author: [ { email: [Array], name: [Array], isAnonymous: [Array] } ],
  ipAddress: [ '66.228.175.178' ],
  thread: [ { '$': [Object] } ] }
  parent: [ { '$': [Object] } ] }
*/

module.exports = Post;