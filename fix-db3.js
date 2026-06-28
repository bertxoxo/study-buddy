var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.run('ALTER TABLE courses ADD COLUMN class_days TEXT', function(err) { console.log('class_days:', err || 'ok'); });
d.run('ALTER TABLE courses ADD COLUMN class_time TEXT', function(err) { console.log('class_time:', err || 'ok'); });
