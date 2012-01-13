Ti.include('mustache.js');
var template = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'template.html');
var body = template.read().text;

var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'docs.json');
var docs = JSON.parse(file.read().text);

var path = Ti.UI.currentWindow.path;
var webView = Ti.UI.createWebView();
Ti.UI.currentWindow.add(webView);	

if(!path) {
	Ti.App.addEventListener('entryWindow:view', function(e) {
		path = e.path;
		Ti.UI.currentWindow.title = e.title;
		Ti.UI.currentWindow.key = e.key;
		prepareView();
	});
}
else {
	prepareView();
}

function prepareView() {
	var section = docs[path];
	section = docs[path];
	section.section = path;
	section.key = Ti.UI.currentWindow.key || '';
	section.hasMethods = section.methods && section.methods.length && section.methods.length > 0;
	section.hasProperties = section.properties && section.properties.length && section.properties.length > 0;
	section.hasEvents = section.events && section.events.length && section.events.length > 0;
	if(section.events) {
		for(var i in section.events) {
			if(section.events[i].properties) {
				var properties = section.events[i].properties;
				section.events[i].properties = [];
				for(var p in properties) {
					section.events[i].properties.push({name: properties[p].name, description: properties[p].summary});
				}			
			}
		}
	}
	section.hasExamples = section.examples && section.examples.length && section.examples.length > 0;
	webView.html = Mustache.to_html(body, section);
}
