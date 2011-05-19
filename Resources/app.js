Titanium.UI.setBackgroundColor('#eee');

Ti.include('checkUpdates.js');
Ti.include('UI.js');

var indicator = UI.createLoadingIndicator();
indicator.show();
var win = Ti.UI.createWindow({backgroundColor: '#eee', layout: 'vertical'});
var img = Ti.UI.createImageView({image: 'images/error.png', top: 80, width: 128, height: 128});
var errorTitle = Ti.UI.createLabel({
	text: 'An error occurred.', 
	textAlign: 'center', 
	font: {fontSize: 18, fontWeight: 'bold'}, 
	color: '#666', 
	height: 'auto',
	top: 30
});

var errorDescription = Ti.UI.createLabel({
	text: 'I can’t connect to the server because a connection error occurred.',
	textAlign: 'center',
	font: {fontSize: 14}, 
	color: '#666', 
	height: 'auto',
	left: 20,
	right: 30
});

var button = Ti.UI.createButton({
	title: 'Retry', 
	height: 30, 
	top: 50, 
	left: 40, 
	right: 40,
	style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
	borderRadius: 8,
	color: '#666',
	backgroundGradient:{
		type:'linear',
		colors:[{color:'#d4d4d4',position:0.0},{color:'#c4c4c4',position:0.50},{color:'#b4b4b4',position:1.0}]
	},
	selectedBackgroundColor: '#666'
});

win.add(img);
win.add(errorTitle);
win.add(errorDescription);
win.add(button);

button.addEventListener('click', function() {
	indicator.show();
	win.close();
	checkUpdates(updateCallback);
});

function updateCallback(e) {
	indicator.hide();
	if(e.success) {
		switch(Ti.Platform.osname) {
			case 'iphone':
			break;
			case 'ipad':
			break;
		}
		var tabgroup = Ti.UI.createTabGroup({barColor: '#666'});
		var version = Ti.App.Properties.getString('docsVersion');
		var treeWindow = Ti.UI.createWindow({title: 'TiDocs ' + version, url: 'TreeWindow.js'});
		var tree = Ti.UI.createTab({window: treeWindow, title: 'Browse', icon: 'images/browse.png'});

		var searchWindow = Ti.UI.createWindow({title: 'Search', url: 'SearchWindow.js', navBarHidden: true});
		var search = Ti.UI.createTab({window: searchWindow, title: 'Search', icon: 'images/search.png'});

		tabgroup.addTab(tree);
		tabgroup.addTab(search);

		tabgroup.open();		
	}
	else {		
		win.open();
	}	
}

checkUpdates(updateCallback);