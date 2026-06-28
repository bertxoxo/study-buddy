var db=require('sqlite3').verbose().Database;
var d=new db('./data/study-buddy.db');
d.serialize(function(){
  d.each('SELECT name FROM sqlite_master WHERE type=?',['table'],function(err,row){
    console.log(row);
  });
});
