/*
// APP.JS
// Simple Code for splitview ipad project
SplitViewApp = {};

// WINDOWS
SplitViewApp.masterWindow = Ti.UI.createWindow({
    title:'Master',
    backgroundColor: '#fff',
    url:'master.js'
});
SplitViewApp.detailWindow = Ti.UI.createWindow({
    title:'Detail',
    backgroundColor: '#fff',
    url:'detail.js'
});


//Forces the application to only open in Landscape
// MASTER NAV GROUP
SplitViewApp.masterNav = Ti.UI.iPhone.createNavigationGroup({
	window:SplitViewApp.masterWindow
});

// DETAIL NAV GROUP
SplitViewApp.detailNav = Ti.UI.iPhone.createNavigationGroup({
	window:SplitViewApp.detailWindow
});

// SPLIT VIEW
SplitViewApp.splitView = Titanium.UI.iPad.createSplitWindow({
	masterView:SplitViewApp.masterNav,
	detailView:SplitViewApp.detailNav
});

Ti.App.addEventListener.addEventListener('app:rowClicked', function(e) {
	Ti.API.log('setMasterPopupVisible');
	// see bug in lighthouse
	// <a href="https://appcelerator.lighthouseapp.com/projects/32238/tickets/2300-hide-master-popover-on-ipad">https://appcelerator.lighthouseapp.com/projects/32238/tickets/2300-hide-master-popover-on-ipad</a>
	SplitViewApp.splitView.setMasterPopupVisible(false);
	SplitViewApp.splitView.setMasterPopupVisible(true);
});

SplitViewApp.splitView.addEventListener('visible', function(e) {

	//if detail view then show button to display master list
	// the framework does this automagically!!
	if (e.view == 'detail') {
		e.button.title = "Master View List";
		SplitViewApp.detailWindow.leftNavButton = e.button;
		Ti.API.log('Set button');
	}
	else if (e.view == 'master') {
		SplitViewApp.detailWindow.leftNavButton = null;
		Ti.API.log('Removed button');
	}
});

SplitViewApp.splitView.open();
*/

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