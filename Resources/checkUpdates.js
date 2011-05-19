Ti.include('MakeTree.js');
Ti.include('UI.js');
var docs = null;
function trimstrip(text) {
	text = text || "";
	text = text.replace(/<\S[^><]*>/g, '');
	text = text.length > 254 ? text.substr(0, 254) + '…' : text;
	return text;
}

var checkUpdates = function(callback) {
	callback = callback || function() {};
	if(!Ti.Network.online) {
		if(Ti.App.Properties.hasProperty('url')) {
			callback({error: false, success: true});
		}
		else {
			callback({error: true, success: false});
		}
		return;
	}

	var url = Ti.App.Properties.getString('url');

	var version = Ti.App.Properties.getString('docsVersion');
	var req = Ti.Network.createHTTPClient();
	var timestamp = new Date().getTime();
	req.open('GET', 'http://melonpielabs.com/tidocs/?' + timestamp);
	req.onerror = function() {
		Ti.API.error('error ' + this.status + ': ' + this.responseText);
		// if error on first run (no url yet)
		if(url == null) {
			callback({error: true, success: false});
		}
	}
	req.onload = function() {
		var response = null;
		if(this.responseText) {
			try {
				response = JSON.parse(this.responseText);
				response.forceUpdate = response.forceUpdate || false;		
			}
			catch(e) {
				callback({error: true, success: false});
			}
			var serverURL = response.url;
			var serverVersion = response.version;

			if(serverVersion != version || response.forceUpdate) {
				url = serverURL;
				Ti.App.Properties.setString('url', url);
				Ti.App.Properties.setString('docsVersion', response.version);

				// update database keys
				try {

					var db = Ti.Database.open('cache.sqlite');

					db.execute('DROP TABLE IF EXISTS cache');
					db.execute('DROP TABLE IF EXISTS entries');
					db.execute('CREATE TABLE IF NOT EXISTS cache (id INTEGER PRIMARY KEY, key TEXT(255), path TEXT(255), description TEXT(255), type TEXT(64))');
					db.execute('CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, name TEXT(255), fullname TEXT(255), parent TEXT(255), hasChild INTEGER)');

					var apireq = Ti.Network.createHTTPClient();
					apireq.open('GET', url);

					apireq.onload = function() {

						var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'docs.json');
						// Titanium.File.createFile
						// file.createFile();
						file.write(this.responseText);

						docs = JSON.parse(this.responseText);
						if(docs) {
							db.execute('DELETE FROM cache');
							db.execute('DELETE FROM entries');

							makeTree(docs, function(name, fullname, hasChild) {
								var parent = fullname.split('.');
								parent.pop();
								parent = parent.join('.');
								db.execute('INSERT INTO entries (name, fullname, parent, hasChild) VALUES (?, ?, ?, ?)', name, fullname, parent, hasChild ? 1 : 0);
								if(docs[fullname].description) {
									var text = trimstrip(docs[fullname].description);
									db.execute('INSERT INTO cache (key, path, description) VALUES (?, ?, ?)', fullname, fullname, text);
								}
							});
						}
						db.close();
						Ti.App.Properties.setBool('indexing', true);
						Ti.App.fireEvent('indexsearch');
						callback({error: false, success: true});
					}

					apireq.onerror = function() {
						Ti.API.error('error ' + this.status + ': ' + this.responseText);
						callback({error: true, success: false});
					}
					
					apireq.send();
					
				}
				catch(e) {
					Ti.API.error('[database] exception: ' + e);
					callback({error: true, success: false});
				}
			}
			else {
				if(Ti.App.Properties.hasProperty('indexing')) {
					Ti.API.info('indexing resumes…')
					Ti.App.fireEvent('indexsearch');					
				}
				callback({error: false, success: true});
			}
		}
	}
	req.send();
	
}

Ti.App.addEventListener('indexsearch', function() {
	Ti.API.info('start indexing…');
	var db = Ti.Database.open('cache.sqlite');
	db.execute('DELETE FROM cache');
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'docs.json');
	var docs = JSON.parse(file.read().text);
	for(var module in docs) {
		var text = trimstrip(docs[module].description);
		db.execute('INSERT INTO cache (key, path, description, type) VALUES (?, ?, ?, ?)', module.split('.').pop(), module, text, 'module');
		if(docs[module].properties) {
			entries = docs[module].properties;
			for(var i in entries) {
				var text = trimstrip(entries[i].value);
				db.execute('INSERT INTO cache (key, path, description, type) VALUES (?, ?, ?, ?)', entries[i].name, module, text, 'property');
			}									
		}
		if(docs[module].methods) {
			entries = docs[module].methods;
			for(var i in entries) {
				var text = trimstrip(entries[i].value);
				db.execute('INSERT INTO cache (key, path, description, type) VALUES (?, ?, ?, ?)', entries[i].name, module, text, 'method');
			}									
		}
	}
	Ti.API.info('indexing complete')
	Ti.App.Properties.removeProperty('indexing');
	Ti.App.fireEvent('indexcomplete');
	db.close();
});