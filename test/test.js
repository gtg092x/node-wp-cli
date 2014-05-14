var WP = require("../index");

WP.load({path:"/Users/matthew.drake/dev/wp-test"},function(WP){	
		
	WP.scaffold.plugin("my-plugin",{plugin_name:"Hello Node WP"},function(err,result){ // creates a new plugin
		console.log(result);
	});	
	
});