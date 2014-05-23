# [wp-cli](http://wp-cli.org/) [![Build Status](https://travis-ci.org/gtg092x/node-wp-cli.svg?branch=master)](https://travis-ci.org/gtg092x/node-wp-cli)

> Node Wrapper for Wordpress CLI

Useful for managing local Wordpress installs via node. All functionality matches the [wp-cli API](http://wp-cli.org/commands/).  

[![NPM](https://nodei.co/npm/wp-cli.png?downloads=true&stars=true)](https://nodei.co/npm/wp-cli/)

## Install

You must install wp-cli for this plugin to work. Please refer to http://wp-cli.org/ for information on getting started. 

```bash
$ npm install --save wp-cli
```


## Usage

```js
var WP = require('wp-cli');
WP.discover({path:'/path/to/install'},function(WP){
	WP.cli.info(function(err,info){ //get CLI info
		console.log(info);
	});		
	WP.comment.list(function(err,comments){ //list comments
		console.log(comments);
	});	
	WP.post.get(1,function(err,comment){ //get post detail
		console.log(comment);
	});	
	WP.core.update(function(err,result){ //updates wordpress install
		console.log(result);
	});	
});
```


## API

### WP.discover(options,callback)
*Alias: `WP.load`*

Options mirror WP-CLI configuration. Refer to [http://wp-cli.org/config/](http://wp-cli.org/config/) for more information.

#### options.path
  
Type: `String`
Default: `'.'`

The wordpress install location.

#### options.url

Type: `String`  
Default: `null`

Note this is for spoofing a URL, this is not for remote management. If you're interested in remote management, I suggest you push the feature request with the authors of [http://wp-cli.org/](http://wp-cli.org/).

#### options.user

Type: `Object or String`  
Default: `'null'`

Pass either a username:password or username|password combination as a String, or an object of the form {username:"name",password:"pass"}. 

#### options.require

Type: `Array`  
Default: `[]`

Load PHP file(s) before running the command.  


#### callback

*Required*
Type: `Function`

Callback that is passed a WP instance. This instance has config options bound to it if you want to manage more than one wordpress install at a time.  


### WP.\<command...\>

The wordpress cli options are pulled from [http://wp-cli.org/commands/cli/cmd-dump/](http://wp-cli.org/commands/cli/cmd-dump/). 

All commands take the form 

```js
WP.<command...>([arguments],[options],callback);
```

Where arguments is an optional argument or array of arguments and options is an optional object of flags and values.

#### Example

```js
var WP = require('wp-cli');
WP.discover(function(WP){
	WP.scaffold.plugin("my-plugin",{plugin_name:"Hello Node WP"},function(err,result){ // creates a new plugin
		console.log(result);
	});	
});
```

Refer to [http://wp-cli.org/commands/](http://wp-cli.org/commands/) for a detailed list of commands and options.

Most commands work with the exception of commands that are interactive prompts or commands that utilize stdin streams. These commands will be supported in future releases using spawn objects.

## License

[MIT](http://opensource.org/licenses/MIT)