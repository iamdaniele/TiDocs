var path = Ti.UI.currentWindow.path || 'Titanium';

var rows = [];

var db = Ti.Database.open('cache.sqlite');
var row = db.execute('SELECT * FROM entries WHERE parent = ? ORDER BY name', path);

rows.push({
	title: path == 'Titanium' ? 'Titanium' : 'Module description',
	fullName: path,
	hasDetail: true
});

while(row.isValidRow()) {
	rows.push({
		title: row.fieldByName('name'), 
		path: row.fieldByName('name'), 
		parentName: row.fieldByName('parent'),
		fullName: row.fieldByName('fullname'),
		hasChild: row.fieldByName('hasChild')
	});
	row.next();
}

var table = Ti.UI.createTableView({data: rows, filterAttribute: 'title'});
// if(index) {
// 	table.index = index;
// }
table.addEventListener('click', function(e) {
	if(e.row.hasChild) {
		var win = Ti.UI.createWindow({url: 'TreeWindow.js', path: e.rowData.fullName, title: e.rowData.path});
		Ti.UI.currentTab.open(win, {animate: true});
	}
	else {
		var win = Ti.UI.createWindow({url: 'Entry.js', path: e.rowData.fullName, title: e.rowData.fullName});
		Ti.UI.currentTab.open(win, {animate: true});
	}
});
Ti.UI.currentWindow.add(table);

