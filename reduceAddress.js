var stdin = require('get-stdin')
var _ = require('underscore')
var fullAddress
var reducedAddress

stdin(function(data) {
  data = JSON.parse(data)
  console.log(_.size(data))	

  _.each(data, function(address){
  	fullAddress = address.address.split(",")
  	//reducedAddress = fullAddress.splice(_.size(fullAddress)-2, -(_.size(fullAddress) -1))
  	console.log(_.last(fullAddress, 2))

  })

})