var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.all('SELECT * FROM quiz_questions WHERE quiz_id = 2', function(err, rows) {
  console.log('Error:', err);
  console.log('Questions:', JSON.stringify(rows, null, 2));
  d.close();
});
