var tabgroup = Ti.UI.createTabGroup({barColor: '#666'});
var version = Ti.App.Properties.getString('docsVersion');
var treeWindow = Ti.UI.createWindow({title: 'TiDocs ' + version, url: 'TreeWindow.js'});

var tree = Ti.UI.createTab({window: treeWindow, title: 'Browse', icon: 'images/browse.png'});
Ti.App.addEventListener('treeWindow:click', function(e) {
	if(e.hasChild) {
		var win = Ti.UI.createWindow({url: 'TreeWindow.js', path: e.path, title: e.fullName});
		tree.open(win, {animate: true});
	}
	else {
		var win = Ti.UI.createWindow({url: 'Entry.js', path: e.path, title: e.fullName});
		tree.open(win, {animate: true});
	}
});

Ti.App.addEventListener('searchWindow:click', function(e) {
	entryWindow.title = e.title;
	entryWindow.key = e.key;
	entryWindow.path = e.path;
	search.open(entryWindow, {animate: true});
});

var searchWindow = Ti.UI.createWindow({title: 'Search', url: 'SearchWindow.js', navBarHidden: true});
var search = Ti.UI.createTab({window: searchWindow, title: 'Search', icon: 'images/search.png'});
var entryWindow = Ti.UI.createWindow({url: 'Entry.js', navBarHidden: false});
tabgroup.addTab(tree);
tabgroup.addTab(search);

tabgroup.open();