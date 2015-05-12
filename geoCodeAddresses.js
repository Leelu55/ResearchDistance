var geocoder = require('geocoder')
var stdin = require('get-stdin')
var _ = require('underscore')



var addresses = []

stdin(function(data) {
    data = JSON.parse(data)
    var addresses = _.pluck(data, "address");
    console.log(addresses.length)
    
    for (i = 0; i < addresses.length; i++){
      var address = (JSON.stringify((addresses[i]).split(".")[0]))
      console.log(address)
      geocoder.geocode(address, function ( err, coord ) {
          console.log(_.pluck(coord.results, "geometry"))
        
      })
    }
      
})
