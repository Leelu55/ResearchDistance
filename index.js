// Run some jQuery on a html fragment
var fs    = require('fs')
var jsdom = require('jsdom')
var util  = require('util');
var jquery = fs.readFileSync("lib/jquery.js", "utf-8") 
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

function authorIndex(resultArr, firstName, lastName) {
    for (var i = 0; i < resultArr.length; i++) {
      if (resultArr[i].firstName == firstName && resultArr[i].lastName == lastName) 
        return i
    }
    return -1
}

function afIndex(af, firstName, lastName) {
    var authorArr = af.split('<br>')
    
    for (var i = 0; i < authorArr.length; i++) {
      var clean = cleanField(authorArr[i])
      authorArr[i] = {
        firstName: clean.split(',')[1].trim(),
        lastName : clean.split(',')[0].trim(),
      }
      console.log(authorArr[i])
      if (authorArr[i].firstName.charAt(0) == firstName && authorArr[i].lastName == lastName) {
        console.log('found!')
        return i
      }
    }
    
    return -1
}


// af is Authors Names field, c1 is Authors Address field (terminology used in WOS export file)
// returns false, if no author or no address
function transformAuthorsFieldIntoAuthorsArray(af, c1, rp) {
  var resultArr  = []
  var authorRaw  = ''
  var addressRaw = ''
  
  // Split, trim and delete items in c1Arr, until we have a clean version of c1Arr
  var c1Arr = c1.split('<br>')
  for (var i = c1Arr.length - 1; i >= 0; i--) {
    c1Arr[i] = cleanField(c1Arr[i])
    if (c1Arr[i].trim() == '')
      c1Arr.splice(i, 1)
  }
  
  // nothing remained in c1Arr, after cleaning it up? 
  if (c1Arr.length == 0)
    return false

  var tmpResultArr = []
  for (var i = 0; i < c1Arr.length; i++) {    
  
    // Case C1: no name "adress"
    if (c1Arr[0].split(']').length == 1) {
      var firstName = af.split(',')[1].trim()
      var lastName  = af.split(',')[0].trim()

      tmpResultArr.push({
            firstName : firstName,
            lastName  : lastName,
            address   : c1Arr[0].trim() 
          })
      
    }
    
    //all cases apart from one author and one entry in c1 field without ["author"] before address
    else {
      authorRaw = c1Arr[i].split(']')[0].split('[')[1].trim()
      addressRaw = c1Arr[i].split(']')[1].trim()
      
      var authors = authorRaw.split(';')
      console.log(authors)
      for (var j = 0; j < authors.length; j++) {
        var firstName = authors[j].split(',')[1].trim()
        var lastName = authors[j].split(',')[0].trim()

        tmpResultArr.push({
          firstName : firstName,
          lastName  : lastName,
          address   : addressRaw
        })
      }
    }
  }
  
  
  for (var i = 0; i < tmpResultArr.length; i++) {    
    var index = authorIndex(resultArr, tmpResultArr[i].firstName, tmpResultArr[i].lastName)
    
    //author not in resultArray means new author
    if (index == -1) {
      
      var rpLastName  = rp.split(',')[0].trim()
      var rpFirstNameInitial = rp.split(',')[1].trim().charAt(0)
      
      //comparing reprint author with entries in authorField (AF)
      var indexAF = afIndex(af, rpFirstNameInitial, rpLastName)
      console.log(indexAF)
      
      //if (!(rpLastName === tmpResultArr[i].lastName && rpFirstNameInitial === tmpResultArr[i].firstName.charAt(0)) && indexAF !== -1) { // @todo authors who are authors and reprint authors at the same time should be included (af rp comparison)
      resultArr.push({
        firstName : tmpResultArr[i].firstName,
        lastName  : tmpResultArr[i].lastName,
        addresses : [tmpResultArr[i].address]
        })
      //}
    }
    
    else {
      resultArr[index].addresses.push(tmpResultArr[i].address)
    }
  }  
  return resultArr
}

jsdom.env({
  html: fs.readFileSync('input.html', 'utf8').toString(),             // read input.html and pass the html into jsdom. jsdom creates a valid DOM for our html
  src : [jquery],                                                     // make sure jQuery is loaded into the DOM, makes jQuery $ variable accessible through window.$ in the callback method
  
  done: function (errors, window) {      
    console.log(errors)                           // use window to access the DOM. Or window.$ to access the DOM via jQuery
    var $ = window.$                                                    // convenience to write $ instead of window.$
    
    $('table').each(function(i, table) {                                // iterate through all <table>s (table = record)
      var ti = ''
      var af = ''
      var c1 = ''
      var rp = ''                             
      var py = ''
      
      $(table).find('tr').each(function(j, tr) {                // iterate through all <tr>s (tr = key + value pair) of the <table>s (table = record)
        var columnName  = $(tr).find('td:eq(0)').html().trim()  // get the key (i.e. "TI", "AF", "C1")
        var columnValue = $(tr).find('td:eq(1)').html().trim()  // get the value (i.e. "Hoffmann, Marc")

        if (columnName === 'TI')
          ti = columnValue
          
        if (columnName === 'AF')
          af = columnValue
          
        if (columnName === 'C1') 
          c1 = columnValue
          
        if (columnName === 'RP')
          rp = columnValue
          
        if (columnName === 'PY')
          py = columnValue
      })
      
      if (ti) {                                                 // only save to result if a title exists
        var record = {
          id      : i,
          title   : transformTitle(ti),
          publicationYear   : transformTitle(py),
          authors : transformAuthorsFieldIntoAuthorsArray(af, c1, rp)
        }
        
        if (record.authors)                                     // only save to result set if authors not false
          output.push(record)
      }
    })
    console.log(util.inspect(output, false, null));
  }
})
