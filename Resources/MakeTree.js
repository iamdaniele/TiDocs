var makeTree = function(docs, callback) {

	var keys = {};
	for(var module in docs) {
		var path = module.split('.');
		tree(path, keys);
	}

	function tree(path, keys) {

		while(module = path.shift()) {

			if(path.length == 0) {
				keys[module] = null;
			}
			else if(!keys[module]) {
				keys[module] = {};
			}					

			tree(path, keys[module]);						
		}
	}

	function walk(tree, path) {
		path = path || [];

		for(var i in tree) {
			path.push(i);
			walk(tree[i], path);
			if(callback) {
				var key = path.join('.');
				callback(i, key, tree[i] != null);
			}
			path.pop();
		}
	}
	
	walk(keys);
}