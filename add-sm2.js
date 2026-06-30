var db = require('sqlite3').verbose();
var d = new db.Database('./data/study-buddy.db');
d.run('ALTER TABLE flashcards ADD COLUMN ease_factor REAL DEFAULT 2.5', function(err) { console.log('ease_factor:', err || 'ok'); });
d.run('ALTER TABLE flashcards ADD COLUMN interval_days INTEGER DEFAULT 0', function(err) { console.log('interval_days:', err || 'ok'); });
d.run('ALTER TABLE flashcards ADD COLUMN repetitions INTEGER DEFAULT 0', function(err) { console.log('repetitions:', err || 'ok'); });
d.run('ALTER TABLE flashcards ADD COLUMN next_review_date TEXT', function(err) { console.log('next_review_date:', err || 'ok'); d.close(); });
