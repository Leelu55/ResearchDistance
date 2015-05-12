var stdin = require('get-stdin')
var _ = require('underscore')
var rawAddressArray = []
var cleanAddressArray = []

stdin(function(data) {
  data = JSON.parse(data)
  
  _.each(data, function(item){
    item.authors.map(function(author) {
      
      for (i = 0; i < author.addresses.length; i++)
        rawAddressArray.push(author.addresses[i])
    })
  })
  
  for (i = 0; i < rawAddressArray.length; i++) {
    var add = {
      address : rawAddressArray[i].trim()
    }
    cleanAddressArray.push(add)
  }
  

    console.log((JSON.stringify(cleanAddressArray)))
})

