var exec = require('child_process').exec,util=require('util');

var isString = function(str){
	return (typeof str == 'string' || str instanceof String);
}

var escapeshell = function(cmd) {
	if(isString(cmd))
		return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
	else
		return '"'+cmd+'"';
};

module.exports.wp = function(use,args,flags,cb){
	
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
	
	var flagArgs = Object.keys(flags).map(function(k){
		if(!Array.isArray(flags[k]))
			flags[k]=[flags[k]];
		return flags[k].map(function(flag){
			return util.format("--%s=%s",k,escapeshell(flag));
		}).join(" ");
	}).join(" ");
	
	
	var helpIfError = function(e,out){
		if(!e)
			return cb(e,out);
		exec("wp help "+use.join(" "),function(err,stdout,stderr){
			if(!err)
				cb(e+"\n\n"+stdout,out);
			else
				cb(e,out);
		});
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