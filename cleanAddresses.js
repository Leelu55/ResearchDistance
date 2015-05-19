var stdin = require('get-stdin')
var _ = require('underscore')
var rawAddressArray = []
var cleanAddressArray = []

function cleanInstitution(rawAddress) {
  var rawInstitution = (((_.first((rawAddress.trim().split(",")))).toString()).trim()).split(" ")
  if (_.indexOf(rawInstitution, "Univ") != -1) 
    rawInstitution[_.indexOf(rawInstitution, "Univ")] = "University"
  return (rawInstitution.toString())
}

stdin(function(data) {
  data = JSON.parse(data)
  
  _.each(data, function(item){
    item.authors.map(function(author) {
      

      for (i = 0; i < author.addresses.length; i++) {
        
        var institution = cleanInstitution(author.addresses[i])

        var country = ", " + ((_.last((author.addresses[i].trim()).split(","),2)).toString()).trim()
        var add = {
          address : institution.concat(country)
        }
        
        cleanAddressArray.push(add)
      }

    })
  })
  

  
/**  for (i = 0; i < cleanAddressArray.length; i++) {
    console.error(cleanAddressArray[i].address)
  }
*/
console.log((JSON.stringify(cleanAddressArray)))

})


  