var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.all('PRAGMA table_info(quiz_questions)', function(err, rows) { console.log(JSON.stringify(rows, null, 2)); d.close(); });
