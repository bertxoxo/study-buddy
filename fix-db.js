var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.run('ALTER TABLE quiz_questions ADD COLUMN type TEXT DEFAULT "multiple-choice"', function(err) {
  console.log(err || 'Column added successfully');
  d.close();
});
