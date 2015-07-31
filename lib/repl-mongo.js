/**
 * @author Nabil Redmann (BananaAcid)
 * @url    banaacid.de/
 */

"use strict";


module.exports = function(Vantage, options) 
{
	const version = require('../package.json').version;

	const Util = require('util')
	    , chalk = require.cache[require.resolve('vantage')].require('chalk');
	var mongo = options.mongo
	  , parseModeEval = (options.parseMode == 'eval')
	  , newOptions = [];


	var VantageProxy = {
		command: function(cmd, desc)
		{ newOptions.push(cmd); return Vantage.command(cmd, desc); },
		mode: function(cmd, desc) { newOptions.push(cmd); return Vantage.mode(cmd, desc); },
		logNewCmds: function(Vantage_log) {Vantage_log( 'Commands:\n' + newOptions.map(function(i,e){ return ' - ' + i + '\n' }).join('') );}
	};


	VantageProxy
		.command('version mongo', 'mongo version ' + version)
		.action(function(cmd,cb) {
			var Vantage_log = this.log.bind(this);

			Vantage_log(
				'Author' + '\n'
				+' * Nabil Redmann (BananaAcid)' + '\n'
				+' * bananaacid.de' + '\n'
			);
			VantageProxy.logNewCmds(Vantage_log);
			cb();
		});


	VantageProxy
		.command('mongo ls <collection>')
		.description('list all documents of a specific mongo collection')
		.action(function(args, cb) {
			var Vantage_log = this.log.bind(this);

			try {
				mongo.db[args.collection].find({}).exec(function(err,objs) { 
					Vantage_log( Util.inspect(objs, {showHidden: true, colors: true}) );
					cb();
				});
			}
			catch (e)
			{
				Vantage_log('"' + args.collection + '" is not a collection.');
				cb();
			}
		});



	var mq = {};

	VantageProxy
		.mode('mongo q <collection>')
		.description('query a mongo collection with commands')
		.init(function(args, cb) {
			var Vantage_log = this.log.bind(this);

			if (!mongo.db[args.collection])
			{
				Vantage_log('"' + args.collection + '" is not a collection.');
				return Vantage.exec('exit');
			}

			mq = {
				qCollection: args.collection,
				qCollectionModeBraces: true,
				qModeFn: 'find',
				qExplainMode: false,
				qDelim: Vantage.session._modeDelimiter
			};

			Vantage.session._modeDelimiter = (chalk.gray(mq.qDelim.trim()) + chalk.green(mq.qModeFn) + chalk.blue('{}') + ':');

			Vantage_log(' Enter Mongo filter object\'s content ( stuff inbetween {} ).\n'
						+ 'FILTER MODE (.f)\n'
						+ (parseModeEval
							? " * -> e.g.  name: {$in: ['test2']}\n"
							: ' * -> e.g.  "name": {"$in": ["test2"]}\n')
						+' * use .inobj or .noobj to enable/disable automatic {} wrapping\n'
						+'INSERT MODE (.i)\n'
						+ (parseModeEval
							? " * -> e.g.  name: 'test2', prop1: 1\n"
							: ' * -> e.g.  "name": "test2", "prop1": 1\n')
						+' * use .inobj or .noobj to enable/disable automatic {} wrapping\n'
						+' * use .explain or .noexplain to enable/disable mongos find/count explain\n'
						+' * enter * to list all without filter\n'
						+' * modes change: ".f" find, ".o" findOne, ".i" insert, ".u" update, ".r" remove, ".c" count, ".m" findAndModify, ".g" group, ".s" save, ".t" stat\n'
						+' *  -> objects notation can be appended to modes:  .f "name":"test"\n'
						+' * use . to execute current mode without any parameters\n'
						+' * also available: .reIndex, .getIndexes, .storageSize, .totalSize, .totalIndexSize, .validate, .ensureIndex\n'
						+' **|Use "exit" or ".." to return. Use "..-" to exit completely.');
			cb();
		})
		.action(function(command, cb) {
			var Vantage_log = this.log.bind(this);

			var qModeOverwrite = null;

			if (command == '..')
				return Vantage.exec('exit');
			else if (command == '..-')
				return Vantage.exec('exit').then(function(){return Vantage.exec('exit --force')});
			else if (command == '.inobj')
			{
				mq.qCollectionModeBraces = true;
				command = '';
			}
			else if (command == '.noobj')
			{
				mq.qCollectionModeBraces = false;
				command = '';
			}
			else if (command == '.explain') // 'nedb' does not support explain
			{
				mq.qExplainMode = true;
				command = '';
			}
			else if (command == '.noexplain')
			{
				mq.qExplainMode = false;
				command = '';
			}
			else if (command == '*')			// list all
			{
				if (mq.qModeFn != 'count')
					qModeOverwrite = 'find';    // does a count otherwise
				command = undefined;
			}
			else if (command == '.')
			{
				qModeOverwrite = mq.qModeFn;
				command = undefined;
			}
			else if (command[0] == '.')
			{
				if (command.substr(1) == 'reIndex')
				{
					qModeOverwrite = 'reIndex';
					command = undefined;
				}
				else if (command.substr(1) == 'getIndexes')
				{
					qModeOverwrite = 'getIndexes';
					command = undefined;
				}
				else if (command.substr(1) == 'storageSize')
				{
					qModeOverwrite = 'storageSize';
					command = undefined;
				}
				else if (command.substr(1) == 'totalSize')
				{
					qModeOverwrite = 'totalSize';
					command = undefined;
				}
				else if (command.substr(1) == 'totalIndexSize')
				{
					qModeOverwrite = 'totalIndexSize';
					command = undefined;
				}
				else if (command.substr(1) == 'validate')
				{
					qModeOverwrite = 'validate';
					command = undefined;
				}
				else if (command.substr(1,11) == 'ensureIndex')
				{
					qModeOverwrite = 'ensureIndex';
					command = command.substr(13);
				}

				else if (command[2] == ' ' || command[2] == undefined)
				{
					if (command[1] == 'f')
					{
						mq.qModeFn = 'find';
						command = command.substr(2);
					}
					else if (command[1] == 'i')
					{
						mq.qModeFn = 'insert';
						command = command.substr(2);
					}
					else if (command[1] == 'r')
					{
						mq.qModeFn = 'remove';
						command = command.substr(2);
					}
					else if (command[1] == 'u')
					{
						mq.qModeFn = 'update';
						command = command.substr(2);
					}
					else if (command[1] == 'c')
					{
						mq.qModeFn = 'count';
						command = command.substr(2);
					}
					else if (command[1] == 'o')
					{
						mq.qModeFn = 'findOne';
						command = command.substr(2);
					}
					else if (command[1] == 'm')
					{
						mq.qModeFn = 'findAndModify';
						command = command.substr(2);
					}
					else if (command[1] == 'g')
					{
						mq.qModeFn = 'group';
						command = command.substr(2);
					}
					else if (command[1] == 's')
					{
						mq.qModeFn = 'save';
						command = command.substr(2);
					}
					else if (command[1] == 't')
					{
						mq.qModeFn = 'stat';
						command = command.substr(2);
					}
				}
			}

			var x = mq.qCollectionModeBraces ? ['{','}'] : ['',''];

			Vantage.session._modeDelimiter = (chalk.gray(mq.qDelim.trim()) + chalk.green(mq.qModeFn) + chalk.blue(x.join('')+'') + ':');

			if (!mongo.db[mq.qCollection])
			{
				Vantage_log('"' + args.collection + '" is not a collection anymore.');
				cb();
				return;
			}

			// just changed mode
			if (!command && !qModeOverwrite)
			{
				cb();
				return;
			}

			try
			{
				if (!((qModeOverwrite||mq.qModeFn) in mongo.db[mq.qCollection]))
					throw 'Function is not in this version of the database driver';

				if (command === undefined)
					var execObj = undefined;
				else
					if (parseModeEval)
						eval('var execObj = ' + x[0] + command + x[1] + ' ');
					else
						var execObj = JSON.parse(x[0] + command + x[1]);

				// not all functions have a return!?
				var m = null;
				if ( (m = mongo.db[mq.qCollection][(qModeOverwrite||mq.qModeFn)](execObj)) )
				{
					if (mq.qExplainMode) m = m.explain();
					// the callback
					m.exec(function(err,objs) { Vantage_log( Util.inspect(objs, {showHidden: true, colors: true}) ); cb(); });
				}
				else
				{
					Vantage_log('done.');
					cb();
				}
			}
			catch (e)
			{
				//entered a number, parser will hit } while searching for a value
				if (e == 'SyntaxError: Unexpected token }')
					e = 'Can not be parsed, use key:value pairs.';

				Vantage_log(e);
				cb();
			}
		});


	var md = {};
	VantageProxy
		.mode('mongo db')
		.description('query the mongo database with all commands')
		.init(function(args, cb) {
			var Vantage_log = this.log.bind(this);

			Vantage_log(' Enter the .MongoCommand and param object\'s content ( stuff inbetween {} ).\n'
						+ (parseModeEval
							? ' * -> parameters can be default JS object notation without quoted keys\n'
							: ' * -> parameters must be JSON encoded\n')
						+' * use .inobj or .noobj to enable/disable automatic {} wrapping\n'
						+' * default mongo help is available through .help\n'
						+' **|Use "exit" or ".." to return. Use "..-" to exit completely.');
			
			md.qCollectionModeBraces = true;
			cb();
		})
		.action(function(command, cb) {
			var Vantage_log = this.log.bind(this);

			var cmdParts = command.match(/^(\S+)\s*(.*)/).slice(1);

			if (command == '..')
				return Vantage.exec('exit');
			else if (command == '..-')
				return Vantage.exec('exit').then(function(){return Vantage.exec('exit --force')});
			else if (cmdParts[0] == '.inobj')
			{
				md.qCollectionModeBraces = true;
				cb();
				return;
			}
			else if (cmdParts[0] == '.noobj')
			{
				md.qCollectionModeBraces = false;
				cb();
				return;
			}


			if (cmdParts[1].trim() == '.')
				cmdParts[1] == '';
			else if (cmdParts[1] === '')
				cmdParts[1] == undefined;

			if (cmdParts[0].length > 1)
				cmdParts[0] = cmdParts[0].substr(1); // remove dot

			try
			{
				if (!(cmdParts[0] in mongo.db) || typeof(mongo.db[cmdParts[0]]) !== 'function' )
					throw 'Function "' +cmdParts[0]+ '" is not in this version of the database driver';

				var x = md.qCollectionModeBraces ? ['{','}'] : ['',''];

				if (cmdParts[1] === undefined)
					var execObj = undefined;
				else
					if (parseModeEval)
						eval('var execObj = ' + x[0] + cmdParts[1] + x[1] + ' ');
					else
						var execObj = JSON.parse(x[0] + cmdParts[1] + x[1]);

				if ( (m = mongo.db[cmdParts[0]](execObj)) )
				{
					// the callback
					m.exec(function(err,objs) { Vantage_log( Util.inspect(objs, {showHidden: true, colors: true}) ); cb(); });
				}
				else
				{
					Vantage_log('done.');
					cb();
				}
			}
			catch (e)
			{
				//entered a number, parser will hit } while searching for a value
				if (e == 'SyntaxError: Unexpected token }')
					e = 'Can not be parsed, use key:value pairs.';

				Vantage_log(e);
				cb();
			}
		});

};