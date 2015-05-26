var async = require('async'),_=require('lodash'),fs=require('fs'),exec = require('child_process').exec,cache=null;

var flagIfRoot = function(){
	return (process.getuid && process.getuid()==0)?" --allow-root":"";//can't say I'm encouraging this against the recommendations of the wp-cli authors.
};

var schema = function(cb){
	
	if(cache)
		return cb(null,cache);
	
	exec("wp cli info"+flagIfRoot()+" --format=json",function(err,stdout,stderr){
		var info = JSON.parse(stdout);
		
		exec("wp cli cmd-dump"+flagIfRoot()+"", {
			maxBuffer: 1024 * 1024
		}, function(err,stdout,stderr){
			
			var data = JSON.parse(stdout);
			//fs.writeFile(__dirname+"/../cache/dump.json",JSON.stringify(data,false,4),console.log);
			data= function parseCLI(data,parent){
				var result={args:[],options:{}};
				result.use = (parent.join(" ")+" "+data.name).trim();
				if(data.subcommands&&data.subcommands.length){
					for(var i =0,sub; sub=data.subcommands[i++];){
						
						result[sub.name.replace("-","_")]=parseCLI(sub,result.use.split(" "));
						if(sub.name.indexOf('-')!=-1)
							result[sub.name]=result[sub.name.replace("-","_")];
					}
				}else{
					result.endpoint=true;
				}
				if(data.synopsis){
					var argFlags =data.synopsis.split(" "); 
					result.args = argFlags.filter(function(arg){
						return !/^\[?--/.test(arg);
					}).map(function(arg){
						var required = !/^\[[^\]]+\]$/.test(arg);
						arg = arg.replace(/[\[\]<>]/g,"");
						
						
						var type = /...$/.test(arg)?"args":"arg";
						
						return {required:required,arg:arg.replace(/\.\.\.$/,""),type:type};
					});
					
					var options = argFlags.filter(function(arg){
						return /^\[?--/.test(arg);
					}).map(function(arg){
						var required = !/^\[[^\]]+\]$/.test(arg);
						arg = arg.replace(/[\[\]<>]/g,"").replace(/^--/,"");
						var type=arg.indexOf("=")==-1?"flag":"param";
						if(type=="flag")
							return {arg:arg,required:required,type:type};
						var args = arg.split('=');
						return {arg:args[0],required:required,type:type};
					});
					var optionsObject={};
					options.forEach(function(flag){
						var arg = flag.arg;
						delete flag.arg;
						optionsObject[arg]=flag;
					});
					
					result.options = optionsObject;
				}
				result.help = data.description;
				return result;
				
			}(data,[]);
			
			//storing version caches, probably not necessary
			//fs.writeFile(__dirname+"/dumps/schema_"+info.wp_cli_version+".json",JSON.stringify(data,false,4));
			cache=data;
			cb(null,data);
		});
	});
};

module.exports.schema = schema;

/**
 * MDRAKE: could use this for immediate loading, but seems lazy
 */

var schemaCache = module.exports.schemaCache = function(){
	//try to get info from cache synchronously
	var schema=null,defaultVersion="0.15.0";
	try{
		schema = JSON.parse(fs.readFileSync(__dirname+"/dumps/schema_"+defaultVersion+".json","utf8"));
	}catch(e){
		
	}
	exec("wp cli info --format=json",function(err,stdout,stderr){
		var info = JSON.parse(stdout);
		if(info.wp_cli_version!=defaultVersion)
			console.log("WP CLI warning: your version of wp-cli does not match the default version schema packaged with this plugin. Please use WP.load or set your wp-cli version to "+defaultVersion);
	});
	return schema;
}
