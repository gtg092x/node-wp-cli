var exec = require('child_process').exec,util=require('util');

var isString = function(str){
	return (typeof str == 'string' || str instanceof String);
};

var escapeshell = function(cmd) {
	if(isString(cmd))
		return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
	else
		return '"'+cmd+'"';
};

module.exports.wp = function(use,args,flags,cb){
	var flagKeys, flagArgs;
	
	if(!Array.isArray(args))
		args=[args];
	if(!args)
		args=[];
	args = use.concat(args);
	
	
	if(!cb){
		cb=flags;
		flags={};
	}
	
	if(flags.format)
		flags.format="json";
	
	if ((typeof flags == "object") && (flags !== null)) {
		flagKeys = Object.keys(flags);
	
		if(process.getuid && process.getuid()==0){
			flags["allow-root"]=true;// assuming you know what you're doing here
			flagKeys.unshift("allow-root");
		}
		
		flagArgs = flagKeys.map(function(k){
			if(!Array.isArray(flags[k]))
				flags[k]=[flags[k]];
			return flags[k].map(function(flag){
				if(flag===true)
					return util.format("--%s",k);
				return util.format("--%s=%s",k,escapeshell(flag));
			}).join(" ");
		}).join(" ");
	} else {
		flagArgs = '"' + flags + '"';
	}
	
	
	var helpIfError = function(e,out){//this is too verbose - should look into formatting help
		if(!e)
			return cb(e,out);
		/*exec("wp help "+use.join(" "),function(err,stdout,stderr){
			if(!err)
				cb(e+"\n\n"+stdout,out);
			else
				cb(e,out);
		});*/
        // shelve this for now
        cb(e,out);
	};
		
	
	exec("wp "+args.join(" ")+" "+flagArgs,function(err,stdout,stderr){
					
		if(flags.format=="json"&&stdout){
			try{
				helpIfError(err||stderr,JSON.parse(stdout));
			}catch(e){
				helpIfError(err||stderr||e,stdout);
			}
		}else
			helpIfError(err||stderr,stdout);
	});
};