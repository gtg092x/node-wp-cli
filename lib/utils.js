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

module.exports.wp = function(args,flags,cb){
	
	if(!Array.isArray(args))
		args=[args];
	
	if(!cb){
		cb=flags;
		flags={};
	}
	
	if(flags.format)
		flags.format="json";
	
	var flagArgs = Object.keys(flags).map(function(k){
		return util.format("--%s=%s",k,escapeshell(flags[k]));
	}).join(" ");
	
	
	
	
	exec("wp "+args.join(" ")+" "+flagArgs,function(err,stdout,stderr){
		if(flags.format=="json"&&stdout)
			cb(err||stderr,JSON.parse(stdout));
		else
			cb(err||stderr,stdout);
	});
};