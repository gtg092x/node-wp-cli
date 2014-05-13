var fs = require('fs'),_=require('lodash'),util=require('util');

fs.readFile(__dirname+"/cache/scrape.json","utf8",function(err,data){
	var commands = JSON.parse(data);
	
	fs.readFile(__dirname+"/gen/overrides.json","utf8",function(err,data){
	
	commands = _.merge(commands,JSON.parse(data));
	
	commands = function sortCommands(commands){
		var sortable = [];
		
		if (typeof commands == 'string' || commands instanceof String)
			return commands;
		
		for (var vehicle in commands)
		      sortable.push([vehicle, commands[vehicle]]);
		      
		
		if(sortable.length==0)
			return commands;
		      
		sortable.sort(function(a, b) {return  a[0] < b[0]?-1:1;});
		
		var result={};
		for(var i=0,kvp; kvp=sortable[i++];){			
			result[kvp[0]]=sortCommands(kvp[1]);
		}
		
		return result;
	}(commands);
	
	
	//oh God how do I do this
	
	
	var sub_template = fs.readFileSync(__dirname+"/gen/sub-template","utf8");
	
	var keywords = ["help","options","commands"];
	
	var result = function buildFile(commands){
	
		var result=[];
		
		if (typeof commands == 'string' || commands instanceof String)
			return [commands];
		
		var keys = Object.keys(commands).filter(function(key){
			return !keywords.some(function(k){
				return k==key;
			});
		});
		
		if(keys.length){
			keys.forEach(function(key){
				result = result.concat(buildFile(commands[key]));	
			});
			 
		}else{
			return keys;
		}
		
		return result;
		
	}(commands);
	
	
	
	var root_template = fs.readFileSync(__dirname+"/gen/main-template","utf8");
	
	
	var file = util.format(root_template,result.join("\n\n"));
	fs.writeFile(__dirname+"/lib/WP.js",file,console.log);
	
	
	
	});
	
});