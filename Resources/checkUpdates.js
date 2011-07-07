Ti.include('UI.js');
var BASE_URL = 'http://melonpielabs.com/tidocs/'
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
	if(url == null) {
		Ti.API.info('first run, installing default database');
		var db = Ti.Database.install('cache.sqlite', 'cache.sqlite');
		db.close();
		Ti.API.info('done');
	}

	var version = Ti.App.Properties.getString('docsVersion');
	var req = Ti.Network.createHTTPClient();
	var timestamp = new Date().getTime();
	req.open('GET', BASE_URL + '?' + timestamp);
	req.onerror = function() {
		Ti.API.error('error ' + this.status + ' while retrieving the version descriptor: ' + this.responseText);
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
			var database = response.db;
			var serverVersion = response.version;
			Ti.API.info('version: ' + version + ', server version: ' + serverVersion);
			if(serverVersion != version || response.forceUpdate) {
				url = database;

				Ti.App.Properties.setString('url', url);
				Ti.App.Properties.setString('docsVersion', response.version);

				var docsFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'docs.json');
				var f = Ti.Network.createHTTPClient();
				f.setTimeout(10000);
				f.onload = function(e) {
					docsFile.write(this.responseText);

					// update database
					Ti.API.info('replacing database')
					var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'../Library/Application Support/database/cache.sqlite.sql');
					var c = Ti.Network.createHTTPClient();
					c.setTimeout(10000);
					c.onload = function(e){
					  	file.write(this.responseData);
						Ti.API.info('file wrote, location: ' + file.nativePath);

						setTimeout(function() {
					  		callback({error: false, success: true});							
						}, 1000);

					};
					
					c.onerror = function(e){
					  	callback({error: true, success: false});
					};
					
					c.open('GET',BASE_URL + url);
					c.send();
				}
				
				f.onerror = function(e) {
					callback({error: true, success: false});
				}

				f.open('GET', response.url);
				f.send();

			}
			else {
				callback({error: false, success: true});
			}
		}
	}
	req.send();	
}
