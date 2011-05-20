Ti.include('UI.js');
var SearchWindow = {
	mainWindow: Ti.UI.currentWindow || Ti.UI.createView(),
	isWindowed: !!Ti.UI.currentWindow,
	search: Ti.UI.createSearchBar({
		top: 0, 
		height: 44, 
		// showCancel: true, 
		hintText: 'Search',
		autocorrect: false,
		autocapitalization: false,
		barColor: '#666'
	}),
	noResultsLabel: Ti.UI.createLabel({
		text: 'No Results', 
		top: 0, 
		color: '#fff', 
		font: {fontSize: 22, fontWeight: 'bold'}, 
		textAlign: 'center'
	}),
	
	noResults: Ti.UI.createView({
		width: 150,
		height: 40,
		backgroundColor: '#444',
		borderRadius: 4,
		zIndex: 100
	}),
	
	indicator: UI.createLoadingIndicator({message: 'Indexing…', asView: true}),
	table: Ti.UI.createTableView({top: 44}),
	db: Ti.Database.open('cache.sqlite'),

	searchHandler: function(e) {
		var value = e.value.replace(/^\ +/, '').replace(/\ $/, '');
		var rowSet = SearchWindow.db.execute('SELECT * FROM cache WHERE key LIKE ?', '%' + value + '%');
		var rows = [];
		var results = false;
		while(rowSet.isValidRow()) {
			results = true;
			var row = Ti.UI.createTableViewRow({hasChild: SearchWindow.isWindowed ? true : false, height: 'auto'});
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
				if(moduleName != 'Titanium' && rowSet.fieldByName('type') == 'module') {
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
		SearchWindow.table.setData(rows);
		if(!results) {
			SearchWindow.noResults.show();
		}
	},

	initListeners: function() {
		SearchWindow.search.addEventListener('return', function(e) {SearchWindow.search.blur()});
		SearchWindow.table.addEventListener('click', function(e) {
			Ti.App.fireEvent('searchWindow:click', {
				path: e.rowData.path,
				title: e.rowData.path,
				key: e.rowData.key
			});
		});
	},
	
	init: function() {
		SearchWindow.initListeners();
		SearchWindow.mainWindow.add(SearchWindow.search);
		SearchWindow.mainWindow.add(SearchWindow.table);
		SearchWindow.noResults.hide();
		SearchWindow.noResults.add(SearchWindow.noResultsLabel);
		SearchWindow.mainWindow.add(SearchWindow.noResults);

		if(Ti.App.Properties.hasProperty('indexing')) {
			var view = SearchWindow.indicator.show();
			SearchWindow.mainWindow.add(view);

			Ti.App.addEventListener('indexcomplete', function() {
				Ti.API.info('index complete, hiding indicator');
				SearchWindow.indicator.hide();
				SearchWindow.start();
			});
		}
		else {
			SearchWindow.start();
		}

	},
	
	start: function() {
		Ti.App.addEventListener('searchWindow:search', SearchWindow.searchHandler)
		var canSearch = false;
		var timeout = null;
		SearchWindow.search.addEventListener('change', function(e) {
			SearchWindow.noResults.hide();
			if(timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			timeout = setTimeout(function() {			
				if(e.value != '') {
					Ti.App.fireEvent('searchWindow:search', {value: e.value});
				}
				clearTimeout(timeout);
				timeout = null;
			}, 1000);
		});
	}
};

SearchWindow.init();