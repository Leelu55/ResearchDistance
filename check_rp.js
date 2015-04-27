var fs    = require('fs')
var jsdom = require('jsdom')
var util  = require('util');

jsdom.env(
  fs.readFileSync('input_many.html', 'utf8').toString(),             // read input.html and pass the html into jsdom. jsdom creates a valid DOM for our html
  ["http://code.jquery.com/jquery.js"],                         // make sure jQuery is loaded into the DOM, makes jQuery $ variable accessible through window.$ in the callback method
  function (errors, window) {                                   // use window to access the DOM. Or window.$ to access the DOM via jQuery
    $ = window.$                                                // convenience to write $ instead of window.$
    
    $('table').each(function(i, table) {                        // iterate through all <table>s (table = record)
      var ti = ''
      var af = ''
      var c1 = ''
      var rp = ''                             
      
      $(table).find('tr').each(function(j, tr) {                // iterate through all <tr>s (tr = key + value pair) of the <table>s (table = record)
        var columnName  = $(tr).find('td:eq(0)').html().trim()  // get the key (i.e. "TI", "AF", "C1")
        var columnValue = $(tr).find('td:eq(1)').html().trim()  // get the value (i.e. "Hoffmann, Marc")

        if (columnName === 'AF')
          console.log(columnValue.split('(')[0])
      })
    })
  }
)
