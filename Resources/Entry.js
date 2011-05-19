Ti.include('mustache.js');
var template = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'template.html');
var body = template.read().text;

var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'docs.json');
var docs = JSON.parse(file.read().text);

var path = Ti.UI.currentWindow.path;
var section = docs[path];
var webView = Ti.UI.createWebView();
section = docs[path];
section.section = path;
section.key = Ti.UI.currentWindow.key || '';
section.hasMethods = section.methods && section.methods.length && section.methods.length > 0;
section.hasProperties = section.properties && section.properties.length && section.properties.length > 0;
section.hasEvents = section.events && section.events.length && section.events.length > 0;
section.hasExamples = section.examples && section.examples.length && section.examples.length > 0;
webView.html = Mustache.to_html(body, section);
Ti.UI.currentWindow.add(webView);