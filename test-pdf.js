var pdf=require('pdf-parse');
var fs=require('fs');
var buf=fs.readFileSync('./public/uploads/13/1782650669224-English_Learning_Materials_3rd_Year_College.pdf');
pdf(buf).then(function(d){console.log('Text length:',d.text.length);console.log('Sample:',d.text.substring(0,200));}).catch(function(e){console.error('Error:',e.message);});
