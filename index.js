// Run some jQuery on a html fragment
var fs    = require('fs')
var jsdom = require('jsdom')
var util  = require('util');
var jquery = fs.readFileSync("lib/jquery.js", "utf-8") 
var output = []

// utility function
function cleanField(field) {
  var res = field.trim()
  res = res.replace('\n', ' ')
  res = res.replace('&amp;', '&')
  res = res.replace(/\s{2,}/g, ' ') // http://stackoverflow.com/a/1981366
  return res
}

// lookup index to avoid duplicate authors
function authorIndex(authorsArr, author) {
  for (var i = 0; i < authorsArr.length; i++) {
    if (authorsArr[i].author == author) 
      return i
  }
  return -1
}

// af is Authors Names field, c1 is Authors Address field (terminology used in WOS export file)
// returns false, if no author or no address
function transformAuthors(af, c1) {
  var resultArr  = []
  var authorRaw  = ''
  var addressRaw = ''
  
  function cleanC1Arr(c1Arr) { // Split, trim and delete items, until we have a clean version of c1Arr
    for (var i = c1Arr.length - 1; i >= 0; i--) {
      c1Arr[i] = cleanField(c1Arr[i])
      if (c1Arr[i].trim() == '')
        c1Arr.splice(i, 1)
    }
    return c1Arr
  }

  /**
   * Should result in an array with the following layout:
   *
   * [
   *   {author: '...', address: '...'}, 
   *   {author: '...', address: '...'}, 
   *   ...
   * ]
   * 
   * There could be multiple occurences of the same author, even
   * possibly (but unlikely) with the same address. This depends
   * on the quality of the input. This Array serves as a temporary
   * structure on our way to a clean output format
   *
   */
  function buildTemporaryAddressArray(c1Arr, af) { // MAP and ...
    var tmpResultArr = []
    for (var i = 0; i < c1Arr.length; i++) {    
    
      // Case C1: no name "address"
      if (c1Arr[0].split(']').length == 1)
        tmpResultArr.push({
          author : af.trim(),
          address: c1Arr[0].trim() 
        })
      
      //all cases apart from one author and one entry in c1 field without ["author"] before address
      else {
        authorRaw  = c1Arr[i].split(']')[0].split('[')[1].trim()
        addressRaw = c1Arr[i].split(']')[1].trim()
        
        var authors = authorRaw.split(';')
        for (var j = 0; j < authors.length; j++) {
          tmpResultArr.push({
            author  : authors[j].trim(),
            address : addressRaw
          })
        }
      }
    }
    return tmpResultArr
  }
  
  /**
   * Takes the output of buildTemporaryAddressArray() as its
   * input to create an output array that looks like this 
   * 
   * [
   *   {author: '...', addresses: ['...', '...', ...]}, 
   *   {author: '...', addresses: ['...', '...', ...]}, 
   *   ...
   * ]
   * 
   * To achieve this, all multiple occurences of an author 
   * are merged into one record per author 
   */
  function mergeDuplicateAuthors(tmpResultArr) { // ... REDUCE
    for (var i = 0; i < tmpResultArr.length; i++) {    
      var index = authorIndex(resultArr, tmpResultArr[i].author)
      
      //author not in resultArray means new author
      if (index == -1) {
        resultArr.push({
          author    : tmpResultArr[i].author,
          addresses : [tmpResultArr[i].address]
        })
      }
      
      else {
        resultArr[index].addresses.push(tmpResultArr[i].address)
      }
    }  
    return resultArr
  }
    
  var c1Arr = cleanC1Arr(c1.split('<br>'))
  if (c1Arr.length == 0) // nothing remained in c1Arr, after cleaning it up? 
    return false

  var tmpResultArr = buildTemporaryAddressArray(c1Arr, af)
  var resultArr    = mergeDuplicateAuthors(tmpResultArr)
  
  return resultArr
}

jsdom.env({
  html: fs.readFileSync('input_many.html', 'utf8').toString(),             // read input.html and pass the html into jsdom. jsdom creates a valid DOM for our html
  src : [jquery],                                                     // make sure jQuery is loaded into the DOM, makes jQuery $ variable accessible through window.$ in the callback method
  
  done: function (errors, window) {      
    var $ = window.$                                                    // convenience to write $ instead of window.$
    var exceptions = []
    var countValidOutputRecords = 1
    
    $('table').each(function(i, table) {                                // iterate through all <table>s (table = record)
      var ti = ''
      var af = ''
      var c1 = ''
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
          
        if (columnName === 'PY')
          py = columnValue
      })
      
      if (ti) {                                                 // only save to result if a title exists
        try {
          var record = {
            id              : countValidOutputRecords++,
            title           : cleanField(ti),
            publicationYear : cleanField(py),
            authors         : transformAuthors(af, c1)
          }

          if (record.authors)                                     // only save to result set if authors not false
            output.push(record)

        } catch(err) {
          exceptions.push({
            ti: ti,
            af: af,
            c1: c1,
            py: py,
            error: err
          })
        }
      }
    })
    
    fs.writeFile('errors.json', util.inspect(exceptions, false, null), 'utf8')
    //output = (util.inspect(output, false, null));
    console.error(output.length)
    console.log(JSON.stringify(output))
    //console.log(JSON.stringify({a: 1, b: 2}))
  }
})
