var UI = {};
UI.navGroup = null;
UI.mainWindow = null;
UI.isIOS = function() {return Ti.Platform.name == 'iPhone OS'}
UI.isAndroid = function() {return Ti.Platform.name == 'android'}
UI.openWindow = function(win) {
	win.UI = UI;
	if(UI.isIOS()) {
		UI.navGroup.open(win);
	}
	else if(UI.isAndroid()) {
		win.open();
	}
}

UI.open = function(win) {
	win.UI = UI;
	if(UI.isIOS() && !UI.navGroup) {
		UI.navGroup = Ti.UI.iPhone.createNavigationGroup({window: win});
		UI.mainWindow = Ti.UI.createWindow({backgroundColor: '#fff'});
		UI.mainWindow.add(UI.navGroup);
		UI.mainWindow.open();
	}
	else if(UI.isAndroid()) {
		win.open();
	}
}

UI.createLoadingIndicator = function(config) {
	config = config || {message: 'Loading…'}
	return new function() {
		//
		//  CREATE CUSTOM LOADING INDICATOR
		//
		var indWin = null;
		var actInd = Titanium.UI.createActivityIndicator({
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			top: 40,
			height:50,
			width:50
		});
		var indView = null;
		this.show = function()
		{
			if (Ti.Platform.osname != 'android')
			{
				// window container
				if(!config.asView) {
					indWin = Titanium.UI.createWindow({
						height:150,
						width:150
					});
					
				}

				// black view
				indView = Titanium.UI.createView({
					height:150,
					width:150,
					backgroundColor:'#000',
					borderRadius:10,
					opacity:0.8
				});
				
				if(!config.asView) {
					indWin.add(indView);					
				}
			}

			if (Ti.Platform.osname != 'android') {
				if(!config.asView) {
					indWin.add(actInd);					
				}
				else {
					indView.add(actInd);
				}

				// message
				var message = Titanium.UI.createLabel({
					text:config.message,
					color:'#fff',
					width:'auto',
					height:'auto',
					font:{fontSize:20,fontWeight:'bold'},
					bottom:20
				});

				if(!config.asView) {
					indWin.add(message);
					indWin.open();					
				}
				else {
					indView.add(message);
				}
			} else {
				actInd.message = config.message;
			}
			actInd.show();
			return indView;
		};

		this.hide = function()
		{
			actInd.hide();
			if (Ti.Platform.osname != 'android') {
				if(!config.asView) {
					indWin.close();					
				}
				else {
					indView.hide();
				}
			}
		};		
	}
}