var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.run('ALTER TABLE courses ADD COLUMN rest_days TEXT', function(err) {
  console.log('rest_days:', err || 'ok');
  d.close();
});
