var geocoder = require('geocoder')
var stdin = require('get-stdin')
var _ = require('underscore')
var sleep = require('sleep')

var checkedAddresses = {}
var globalIndex = 0

function doGeoCode(addresses) {
  console.error('doGeoCode(' + globalIndex + ')')
  var address = JSON.stringify((addresses[globalIndex]).split(".")[0])
  
  if (checkedAddresses[address]) {
    if (globalIndex < addresses.length - 1) { 
      globalIndex++
      doGeoCode(addresses)
    }
    return 
  }
  
  geocoder.geocode(address, function( err, coord ) {
    if (err)
      console.error('err: ', err)

    var result = null
    if (coord.status === "OK") {
      console.error(coord.results)
      result = {
        geometry: _.pluck(coord.results, "geometry"),
        address_components: _.pluck(coord.results, "address_components")
      }
    }
    else { 
      result = "++++++" + "Geocoder failed due to: " + coord.status
      //console.error(brokenAddresses)
    }
    
    checkedAddresses[address] = result
    
    sleep.usleep(500000)
    if (globalIndex < addresses.length - 1) { 
      globalIndex++
      doGeoCode(addresses)
    }
    
    if (globalIndex === addresses.length - 1) {
      var prettyjson = require('prettyjson');
      console.log(prettyjson.render(checkedAddresses, {noColor: false}))
    }
  })
}

stdin(function(data) {
  data = JSON.parse(data)
  var addresses = _.pluck(data, 'address');
  console.error(addresses.length)
  doGeoCode(addresses)
  /*
  
  var address
  for (var i = 0; i < addresses.length; i++) {
    address = JSON.stringify((addresses[i]).split(".")[0])
    console.error(address)
    geoCode(address)
  }
  
  console.error(brokenAddresses)
  */
})
