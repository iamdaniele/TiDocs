var version = Ti.App.Properties.getString('docsVersion');
var treeWindow = Ti.UI.iPhone.createNavigationGroup({
	window: Ti.UI.createWindow({title: 'TiDocs ' + version, url: 'TreeWindow.js'})
});

Ti.include('/SearchWindow.js');
Ti.App.addEventListener('searchWindow:click', function(e) {
	Ti.App.fireEvent('entryWindow:view', {path: e.path, title: e.title, key: e.key});
	SearchWindow.search.value = '';
	searchPopover.hide();
});

var entry = Ti.UI.createWindow({url: 'Entry.js'});
var entryWindow = Ti.UI.iPhone.createNavigationGroup({
	window: entry
});

var searchButton = Ti.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.SEARCH});
entry.rightNavButton = searchButton;
var searchPopover = Ti.UI.iPad.createPopover({
	width: 320,
	height: 480,
	title: 'Search'
});

searchPopover.add(SearchWindow.mainWindow);

searchButton.addEventListener('click', function() {
	searchPopover.show({view: searchButton});
});

var splitWindow = Ti.UI.iPad.createSplitWindow({
	masterView: treeWindow,
	detailView: entryWindow
});

Ti.App.addEventListener.addEventListener('treeWindow:click', function(e) {

	if(e.hasChild) {
		var win = Ti.UI.createWindow({url: 'TreeWindow.js', path: e.path, title: e.fullName});
		treeWindow.open(win, {animate: true});
	}
	else {
		Ti.App.fireEvent('entryWindow:view', {path: e.path, title: e.fullName});
		splitWindow.setMasterPopupVisible(false);
		splitWindow.setMasterPopupVisible(true);
	}
});

splitWindow.addEventListener('visible', function(e) {
	if (e.view == 'detail') {
		e.button.title = 'Index';
		entry.leftNavButton = e.button;
	}
	else if (e.view == 'master') {
		entry.leftNavButton = null;
	}
});

splitWindow.open();