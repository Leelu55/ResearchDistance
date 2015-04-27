// Run some jQuery on a html fragment
var fs    = require('fs')
var jsdom = require('jsdom')
var util  = require('util');

var output = []

function cleanField(field) {
  var res = field.trim()
  res = res.replace('\n', ' ')
  res = res.replace('&amp;', '&')
  res = res.replace(/\s{2,}/g, ' ') // http://stackoverflow.com/a/1981366
  return res
}

// still a very dumb proxy method, but we may add more to this method later
function transformTitle(ti) {
  return cleanField(ti)
}

// af is Authors Names field, c1 is Authors Address field (terminology used in WOS export file)
// returns false, if no author or no address
function transformAuthorsFieldIntoAuthorsArray(af, c1) {
  var resultArr  = []
  var authorRaw  = ''
  var addressRaw = ''

/*
  var arr = af.split('<br>') 
  for (var i = 0; i < arr.length; i++) {
    authorFullName = arr[i].trim()
    resultArr.push({
      firstName : authorFullName.split(',')[1].trim(),
      lastName  : authorFullName.split(',')[0].trim(),
      adresses  : []
    })
  }
  */
  
  // Split, trim and delete items in c1Arr, until we have a clean version of c1Arr
  var c1Arr = c1.split('<br>')
  for (var i = c1Arr.length -1; i >= 0; i--) {
    c1Arr[i] = cleanField(c1Arr[i])
    if (c1Arr[i].trim() == '')
      c1Arr.splice(i, 1)
  }
  
  // nothing remained in c1Arr, after cleaning it up? 
  if (c1Arr.length == 0)
    return false
  
  // special case when c1 field has only address
  if (c1Arr.length == 1) {
    
    // Case C1: no name "adress"
    if (c1Arr[0].split(']').length == 1) {
      authorRaw = af
      addressRaw = c1Arr[0]
    }
    
    // Case C1: "[Doe, John] address"
    if (c1Arr[0].split(']').length == 2) {
      authorRaw = c1Arr[0].split(']')[0].split('[')[1].trim()
      addressRaw = c1Arr[0].split(']')[1].trim()
    }
    
    // return 1 author with 1 address
    return [{
      firstName : authorRaw.split(',')[1].trim(),
      lastName  : authorRaw.split(',')[0].trim(),
      addresses : [addressRaw]
    }]
  }
    
  // now implement the complicated case:
  // 1. multiple authors at one address (semicolon separated)
  // 2. multiple authors (at different) locations
  // 3. one author, multiple locations

  if (c1Arr.length >= 2) {
    
    for (var i = c1Arr.length -1; i >= 0; i--) {
      
      if (authorRaw === '') {
        authorRaw = c1Arr[i].split(']')[0].split('[')[1].trim()
        addressRaw = c1Arr[i].split(']')[1].trim()
        console.log(authorRaw + "+++++++++++++++++++++++++++++++++")

      }
      
      if (authorRaw != '' && c1Arr[i].split(']')[0].split('[')[1].trim() === authorRaw) {
        
        //authorRaw = c1Arr[i].split(']')[0].split('[')[1].trim()
        addressRaw = c1Arr[i].split(']')[1].trim()
        console.log(authorRaw + "*******************************************")

        
      }
      
      if (authorRaw != '' && c1Arr[i].split(']')[0].split('[')[1].trim() != authorRaw ) {
        
        if (authorRaw != '' && c1Arr[i].split(']')[0].split('[')[1].split(";").length > 1 ) {
        
          authorsSemicolonSeperated = c1Arr[i].split(']')[0].split('[')[1].split(";")
          console.log(authorsSemicolonSeperated)
        
          for (var j = authorsSemicolonSeperated.length -1; j >=0; j--) {
          
            authorRaw = authorsSemicolonSeperated[j].trim()
            addressRaw = c1Arr[i].split(']')[1].trim()
          
            var Record = {
              firstName : authorRaw.split(',')[1].trim(),
              lastName  : authorRaw.split(',')[0].trim(),
              addresses : [addressRaw]
            }  
      
            resultArr.push(Record)
          }
        }
        
        else {
          authorRaw = c1Arr[i].split(']')[0].split('[')[1].trim()
          addressRaw = c1Arr[i].split(']')[1].trim()
          
          
          console.log(authorRaw + "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        }
      }
    
      
      var Record = {
        firstName : authorRaw.split(',')[1].trim(),
        lastName  : authorRaw.split(',')[0].trim(),
        addresses : [addressRaw]
      }  
      
      resultArr.push(Record)
      
      
    }
    console.log(authorRaw + "§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§")
    
  }
    
  // now implement the complicated case:
  // 1. multiple authors at one address
  // 2. multiple authors (at different) locations
  // 3. one author, multiple locations

      
  return resultArr
}

jsdom.env(
  fs.readFileSync('input.html', 'utf8').toString(),             // read input.html and pass the html into jsdom. jsdom creates a valid DOM for our html
  ["http://code.jquery.com/jquery.js"],                         // make sure jQuery is loaded into the DOM, makes jQuery $ variable accessible through window.$ in the callback method
  function (errors, window) {                                   // use window to access the DOM. Or window.$ to access the DOM via jQuery
    $ = window.$                                                // convenience to write $ instead of window.$
    
    $('table').each(function(i, table) {                        // iterate through all <table>s (table = record)
      var ti = ''
      var af = ''
      var c1 = ''                             
      
      $(table).find('tr').each(function(j, tr) {                // iterate through all <tr>s (tr = key + value pair) of the <table>s (table = record)
        var columnName  = $(tr).find('td:eq(0)').html().trim()  // get the key (i.e. "TI", "AF", "C1")
        var columnValue = $(tr).find('td:eq(1)').html().trim()  // get the value (i.e. "Hoffmann, Marc")

        if (columnName === 'TI')
          ti = columnValue
          
        if (columnName === 'AF')
          af = columnValue
          
        if (columnName === 'C1') 
          c1 = columnValue
      })
      
      if (ti) {                                                 // only save to result if a title exists
        var record = {
          id      : i,
          title   : transformTitle(ti),
          authors : transformAuthorsFieldIntoAuthorsArray(af, c1)
        }
        
        if (record.authors)                                     // only save to result set if authors not false
          output.push(record)
      }
    })
    console.log(util.inspect(output, false, null));
  }
)
