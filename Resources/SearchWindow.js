Ti.include('UI.js');
var mainWindow = Ti.UI.currentWindow;
var search = Ti.UI.createSearchBar({
	top: 0, 
	height: 44, 
	showCancel: true, 
	hintText: 'Search',
	autocorrect: false,
	autocapitalization: false,
	barColor: '#666'
});
search.addEventListener('return', function(e) {search.blur()});
search.addEventListener('cancel', function(e) {search.blur()});

var win = Ti.UI.createWindow({url: 'Entry.js', navBarHidden: false});
var table = Ti.UI.createTableView({top: 44});
table.addEventListener('click', function(e) {
	win.path = e.rowData.path;
	win.title = e.rowData.path;
	win.key = e.rowData.key;
	Ti.UI.currentTab.open(win, {animate: true});
});
mainWindow.add(search);
mainWindow.add(table);

var indicator = UI.createLoadingIndicator({message: 'Indexing…', asView: true});

if(Ti.App.Properties.hasProperty('indexing')) {
	var view = indicator.show();
	mainWindow.add(view);
	
	Ti.App.addEventListener('indexcomplete', function() {
		Ti.API.info('index complete, hiding indicator');
		indicator.hide();
		start();
	});
}
else {
	start();
}
var db = Ti.Database.open('cache.sqlite');

function searchHandler(e) {
	var rowSet = db.execute('SELECT * FROM cache WHERE key LIKE ?', '%' + e.value + '%');
	var rows = [];
	while(rowSet.isValidRow()) {

		var row = Ti.UI.createTableViewRow({hasChild: true, height: 'auto'});
		row.path = rowSet.fieldByName('path');
		row.key = rowSet.fieldByName('key');

		var view = Ti.UI.createView({
			height: 'auto',
			layout: 'vertical',
			top: 5,
			bottom: 5,
			left: 5,
			right: 5				
		});
		
		var image = Ti.UI.createImageView({
			image: 'images/' + rowSet.fieldByName('type') + '.png',
			top: 3,
			left: 0,
			height: 15,
			width: 15
		});

		view.add(image);
		var title = Ti.UI.createLabel({
			top: -18,
			left: 20,
			text: rowSet.fieldByName('key'),
			color: '#000',
			font: {fontSize: 18, fontWeight: 'bold'},
			height: 22
		});
		view.add(title);

		var moduleName = rowSet.fieldByName('path');
		if(!(rowSet.fieldByName('key') == 'Titanium' && moduleName == 'Titanium')) {
			if(moduleName != 'Titanium') {
				moduleName = moduleName.split('.');
				moduleName.pop();
				moduleName = moduleName.join('.');					
			}

			var module = Ti.UI.createLabel({
				text: moduleName,
				color: '#222',
				font: {fontSize: 12},
				height: 14,
				left: 20
			});

			view.add(module);
		}

		var descriptionText = rowSet.fieldByName('description');
		if(descriptionText != '') {
			var description = Ti.UI.createLabel({
				text: descriptionText,
				color: '#666',
				font: {fontSize: 12},
				height: 14,
				left: 20
			});				
			view.add(description);
		}

		row.add(view);

		rows.push(row);
		rowSet.next();
	}
	rowSet.close();
	table.setData(rows);
	
}

function start() {
	Ti.App.addEventListener('search', searchHandler)
	var canSearch = false;
	var timeout = null;
	search.addEventListener('change', function(e) {
		if(timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(function() {			
			if(e.value != '') {
				Ti.App.fireEvent('search', {value: e.value});
			}
			clearTimeout(timeout);
			timeout = null;
		}, 1000);
	});
}