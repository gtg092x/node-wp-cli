//mdrake - better to use CLI dump
var jsdom = require('jsdom'),async = require('async'),_=require('lodash');

var topLevel = function($,cb){
	
	subCommand($,cb);	

};

var commandDetail = function($,cb){
	if(!cb)
		cb=function(){};
	
	var args=[];
	var options={};
	$("dl dt").each(function() {
		/**
		 * Command Details
		 */
		var cmd = $(this).text().trim();
		var help = $(this).next("dd").text().trim();
		
		var parseFlag = function(cmd){
			var args = cmd.split("=");			
			var arg=args[1];
			
			var flag = args[0].replace(/^--/,"");
			//cmd = {};
			//cmd[flag]=arg||true;
			return [flag,arg];
		};
		
		var optional = /^\[([^\]]+)\]$/.test(cmd);
		var typ = null;
		
		cmd = cmd.replace(/^\[/,"").replace(/\]$/,"").replace(/[<>]/g,"");
		
		if(/^--/.test(cmd)){
			//flag
			typ="flag";
			cmds = parseFlag(cmd);
			cmd = cmds[0];
			if(!!cmds[1])typ="param";
			options[cmd]=({required:!optional,help:help,type:typ});
		}else if(/^([^\u2026]*)\u2026$/.test(cmd)){
			//arg array
			typ="args";
			cmd = cmd.match(/^([^\u2026]*)\u2026$/)[1];
			args.push({arg:cmd,required:!optional,help:help,type:typ});
		}else{
			//arg		
			typ="arg";
			cmd = cmd.trim();
			args.push({arg:cmd,required:!optional,help:help,type:typ});
		}
		
		console.log("CMD",cmd,optional?"optional":"required", help);
		//result.push({arg:cmd,required:!optional,help:help,type:typ});
	});
	
	var result = {options:options,args:args};
	cb(null,result);
	return result;
};

var subCommand = function($,cb){
	var series_seed={};
	
		$("tbody tr").each(function() {//remove eq 0 for prod
			/**
			 * SubCommands
			 */
			var anch = $("td:eq(0) a", this);
			var link = $(anch).attr("href");
			var title = $(anch).text().trim();
			var help = $("td:eq(1)",this).text().trim();
			console.log(title, link, help);
			
			series_seed[title]=function(cb){
			
				jsdom.env("http://wp-cli.org"+link,[ "http://code.jquery.com/jquery.js" ], function(errors, window) {
					var $ = window.$;
					var result={};
					if($("#main_content dl").length)
						result=_.merge(commandDetail($),result);
					else if(!$("#subcommands").length){						
						result.args=[];
						result.options={};
					}
					
					result.use = $("p code").text().trim();					
					$("pre code").each(function() {//should only be one
						/**
						 * Examples
						 */
						var commands = $(this).text().trim();
						if(commands){
							commands=commands.split('\n').filter(function(c){return !!c;});
						}else{
							commands=[];
						}
						console.log("Examples",commands);
						result.examples=commands;
					});
					
					if($("#subcommands").length){						
							subCommand($,function(err,commands){
								cb(null,_.merge(commands,result));
							});
					}else{
						result.endpoint=true;
						cb(null,result);
					}
						
				});//subcommand detail jsom
			
			};
		});
	async.series(series_seed,cb);
};

jsdom.env("http://wp-cli.org/commands/",[ "http://code.jquery.com/jquery.js" ], function(errors, window) {
	var $ = window.$;
	topLevel($,function(err,result){
		console.log("RESULT",result);
		require('fs').writeFile(__dirname+"/../cache/scrape.json",JSON.stringify(result,null,4),function(){
			console.log(err||"Success");
		});
	});
});//command jsdom