# vantage-repl-mongo

##### CHanges
1.0.2 results are now shown in the remote vantage shell insance


##### Installation

```bash
npm install vantage-repl-mongo
npm install vantage
```

##### Programmatic use

```js
// app.js
var Vantage = require('vantage')
  , repl = require('vantage-repl-mongo')
  ;

var vantage = Vantage();

vantage
  .delimiter('node~$')
  .use(repl, {mongo: mongo, parseMode: 'eval'})
  .show();
```

mongo is the mongo instance, parseMode is either 'eval' or 'json'

usage info is given if 'q' or 'db' mode is started.

##### compatible with NeDB
( https://github.com/louischatriot/nedb ) if collections are packed into mongo.db.* and used as instance

```js
var mongo = {
  db: {
    motds:    new Datastore('mongodb-offline/motds.db')
  }
};
mongo.db.motds.loadDatabase();

vantage
  .use(repl, {mongo: mongo, parseMode: 'eval'})
  .show();
```

##### get info

You may open the help to see its details, and possible commands
```
node~$ mongo

  Commands:

    mongo ls <collection>  list all documents of a specific mongo collection
    mongo q <collection>   query a mongo collection with commands
    mongo db               query the mongo database with all commands

node~$ version mongo
Author
 * Nabil Redmann (BananaAcid)
 * bananaacid.de

Commands:
 - version mongorepl
 - mongo ls <collection>
 - mongo q <collection>
 - mongo db
```

```
node~$ mongo q motds
 Enter Mongo filter object's content ( stuff inbetween {} ).
FILTER MODE (.f)
 * -> e.g.  name: {$in: ['test2']}
 * use .inobj or .noobj to enable/disable automatic {} wrapping
INSERT MODE (.i)
 * -> e.g.  name: 'test2', prop1: 1
 * use .inobj or .noobj to enable/disable automatic {} wrapping
 * use .explain or .noexplain to enable/disable mongos find/count explain
 * enter * to list all without filter
 * modes change: ".f" find, ".o" findOne, ".i" insert, ".u" update, ".r" remove, ".c" count, ".m" findAndModify, ".g" group, ".s" save, ".t" stat
 *  -> objects notation can be appended to modes:  .f "name":"test"
 * use . to execute current mode without any parameters
 * also available: .reIndex, .getIndexes, .storageSize, .totalSize, .totalIndexSize, .validate, .ensureIndex
 **|Use "exit" or ".." to return. Use "..-" to exit completely.
node~$ mongo q motds:find{}: .c
node~$ mongo q motds:count{}: .
3
node~$ mongo q motds:count{}: .f
node~$ mongo q motds:find{}: type:'info'
[ { type: 'info',
    UniqueId: '70DC2DDF',
    msg: 'hallo nabil.',
    date: '2015-07-02',
    _id: '2Mzd6UECvr4B3UPX' },
  { type: 'info',
    UniqueId: null,
    msg: 'This is a server test message',
    date: '2015-07-02',
    _id: 'e1eY34Sca1FeR71t' },
  [length]: 2 ]
node~$ mongo q motds:find{}: .i type:'info', UniqueId:'SD45G3425', msg:'hello world', date:'2015-07-28'
[Info] done. ---> INSERTED
node~$ mongo q motds:insert{}:
node~$ mongo q motds:insert{}: ..
node~$ 
```
Note: the .whatever commands change the mode, making all future entered objects to use that specific mode


Bugs:
  * '..' and '..-' execute on the main server instance.
