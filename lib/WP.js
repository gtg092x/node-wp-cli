var cli = require('./utils').wp,schema = require('./commands').schema,schemaCache = require('./commands').schemaCache,_=require('lodash'),util=require('util'); 

var WP = function(options){
	this.options=options||{};
};

var isObject= function(arg){
	return (typeof arg == "object") && (arg !== null);
};

var keywords = ["use","help"];

var isKeyword = function(k){
	return !keywords.some(function(kk){
		return kk==k;
	});
};

var isFunction = function(func){
	return typeof(func) == 'function';
}

WP.discover = function(options,cb){


	
	if(!cb){
		cb=options;
		options={};
	}

    var verbose = options.verbose===undefined?false:options.verbose;
    delete options.verbose;
	
	var wp = new WP(_.clone(options));
	
	schema(function(err,schema){
		
		
		
		
		var toMerge = function mapSchema(schema){
			var result={};
			var keys = Object.keys(schema).filter(isKeyword);
			keys.forEach(function(key){
				var command = schema[key];
				if(!command.endpoint){
					if(!isObject(command))
						throw "No object at "+key;
					result[key]=mapSchema(command);
				}else{
					result[key] = function(){
						//build WP function
						
						//normalize args
						var args = Array.prototype.slice.call(arguments);
						
						var use = command.use;
						if(!use)
							throw "No CLI mapping for "+key;
						
						var cb = args.pop();
						if(!isFunction(cb))
							throw "No callback supplied";
						
						var arg = args[0];
						var options={};
						if( isObject(arg) &&!Array.isArray(arg)&&args.length==1){
							options=arg;
							arg=[];
						}else{
							if(arg)
								arg = Array.isArray(arg)?arg:[arg];
							else
								arg=[];
							options = args[1]||{};
						}
						use = use.replace(/^wp /,"").split(" ");
						
						//end normalize args
						
						//check commands and supply defaults, setting default format to json
						if(command.options&&command.options.format&&!options.format)
							options.format="json";
						
						var schemaOptionKeys = Object.keys(command.options);
						schemaOptionKeys.forEach(function(key){
							var schemaOption=command.options[key];
							if(schemaOption.required&&key!="field"&&!options[key]){//field is used to represent kwargs in api
								throw "Error option <"+key+"> is required for "+use.join(" ")+". See http://wp-cli.org/commands/"+use.join('/');
							}
						});
						
						var required = command.args.filter(function(arg){
							return arg.required;
						});
						if(required.length>args.length)
							throw "Error args "+required.map(function(r){return "<"+r.arg+">";}).join(" ")+" are required for "+use.join(" ")+"."+" See http://wp-cli.org/commands/"+use.join('/');
						
						//end check commands
						options = _.merge(options,wp.options);
						
						if(options.user&&isObject(options.user)){
							options.user = options.user.username+"|"+options.user.password;							
						}
						if(options.user)
						options.user = options.user.replace(":","|");
						
						cli(use,arg,options,cb);
						//build WP function
					};
				}
			});
			return result;
		}(schema);
		
			
		wp = _.merge(wp,toMerge);		
		cb(wp);
	});
};

WP.load = WP.discover;

module.exports.WP=WP;