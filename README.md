# vantage-repl-mongo

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

compatible with NeDB ( https://github.com/louischatriot/nedb ) if collections are packed into mongo.db.*


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