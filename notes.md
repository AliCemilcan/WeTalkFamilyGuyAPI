mongod -> starts the mongo db server on local
mongo -> opens the interactive terminal
show dbs -> shows the databases on your machine
use "database_name" -> create and switch to new DB
show collections -> shows all "tables"


mongoDB -> get One Collection's data -> "collection".find() // empty brackets will return all data

```	const user = await User.findById(payload.id)
		.select('-password')
		.lean().exec()
}```

.lean() -> use Basic JavaScript Object to get data from Schema, not getting mongo document uses less memory on your CPU