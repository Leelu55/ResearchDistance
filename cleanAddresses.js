var stdin = require('get-stdin')
var _ = require('underscore')
var addresses = []


stdin(function(data) {
  data = JSON.parse(data)
  //console.log(data.length)
  var rawAddressArray = []
  
  _.each(data, function(item){
    //console.log(item.id + "\n")
    
    for (var i = 0; i < item.authors.length; i++) {
      //console.log(i + " " + JSON.stringify(item.authors[i].author) + "\n")
        for (var j = 0; j < (item.authors[i].addresses).length; j++) {
          rawAddressArray.push((item.authors[i].addresses[j]).split(","))
        }
      
    }
    return rawAddressArray
    //console.log(item)
  })
  //console.log(addressArray.length)
  
  var addressArray = []
  
  
  for (i = 0; i < rawAddressArray.length; i++) {
    cleanAddress = ((((rawAddressArray[i]).toString()).trim()).split(".")[0])
    
    var record = {
      address : cleanAddress, 
      latLng  : ''
    }
    addresses.push(record)
  }
  
  for (i = 0; i < addresses.length; i++) 
    console.log(addresses[i])
})

