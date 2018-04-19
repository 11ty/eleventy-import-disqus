const fs = require("fs");
const xml2js = require("xml2js");
const parseString = xml2js.parseString;
const Thread = require("./src/Thread");
const Post = require("./src/Post");
const contentMap = require("./input/contentMap.json");

let xml = fs.readFileSync("./input/disqus.xml", "utf-8");
let threads = {};

parseString(xml, function (err, result) {
	for(let threadObj of result.disqus.thread) {
		let thread = new Thread(threadObj);
		threads[ thread.getThreadId() ] = thread;
	}

	// console.dir([0]);
	for( let postObj of result.disqus.post ) {
		let post = new Post(postObj);
		threads[ post.getThreadId() ].addPost(post);
	}

	let countsOutput = {};
	for( let threadId in threads ) {
		if(!threads[threadId].isEmpty()) {
			let url = threads[threadId].getPath();
			countsOutput[url] = threads[threadId].getCount();

			console.log( url, 'maps to', contentMap[url] );
			if(!contentMap[url]) {
				throw new Error(`Could not find contentMap.json entry for ${url}`);
			}
			let contentFilename = contentMap[url].split('/').pop();
			let split = contentFilename.split(".");
			split.pop();
			let dataFilename = split.join(".");
			// console.log( dataFilename );

			fs.writeFileSync(`output/${dataFilename}.json`, JSON.stringify({
				"disqus": threads[threadId].toObject()
			}), "utf-8");
		}
	}

	if(Object.keys(countsOutput).length) {
		fs.writeFileSync(`output/commentsCounts.json`, JSON.stringify(countsOutput), "utf-8");
	}

});

