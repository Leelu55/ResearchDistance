var geocoder = require('geocoder')
var stdin = require('get-stdin')
var _ = require('underscore')
var sleep = require('sleep')

var checkedAddresses = {}
var geoCodedAddresses = {}
var brokenAddresses = {}

var globalIndex = 0

function doGeoCode(addresses) {
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
    var fail = null
    console.error('doGeoCode(' + globalIndex + ')')

    if (coord.status === "OK") {
      //console.error(coord.results)
      result = {
        geometry: _.pluck(coord.results, "geometry"),
        address_components: _.pluck(coord.results, "address_components")
      }
      geoCodedAddresses[address] = result
    }

    else { 
      fail = {
        failStatus: coord.status,
        failedAddress: address
      }
      brokenAddresses[address] = fail
    }
  
    checkedAddresses[address] = address
    
    sleep.usleep(500000)
    if (globalIndex < addresses.length - 1) { 
      globalIndex++
      doGeoCode(addresses)
    }
    
    if (globalIndex === addresses.length - 1) {
      var prettyjson = require('prettyjson');
      //console.log(prettyjson.render(checkedAddresses, {noColor: true}))
      console.log(prettyjson.render(geoCodedAddresses, {noColor: true}))      
      console.log("#geoCodedAddresses: " + _.size(geoCodedAddresses))
      console.log("#brokenAddresses: " + _.size(brokenAddresses))

      console.log(prettyjson.render(brokenAddresses, {noColor: true}))


    }
  })
}

stdin(function(data) {
  data = JSON.parse(data)
  var addresses = _.pluck(data, 'address');
  console.error(addresses.length)
  doGeoCode(addresses)
  
  
})
