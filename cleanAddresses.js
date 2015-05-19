var stdin = require('get-stdin')
var _ = require('underscore')
var rawAddressArray = []
var cleanAddressArray = []

function cleanAddress(rawAddress) {
  rawAddress = rawAddress.trim().split(",")
  
  
  _.each(rawAddress, function(field, index) {
    var splittedField = field.split(".")[0].trim().split(" ")
      
    if (_.indexOf(splittedField, "Univ") != -1 ) 
    splittedField[_.indexOf(splittedField, "Univ")] = "University"
  
    if (_.indexOf(splittedField, "Inst") != -1 ) 
      splittedField[_.indexOf(splittedField, "Inst")] = "Institute"
      
    if (_.indexOf(splittedField, "Sci") != -1 ) { 
      
      splittedField[_.indexOf(splittedField, "Sci")] = "Science"
    }
    if (_.indexOf(splittedField, "Technol")  != -1 ) 
      splittedField[_.indexOf(splittedField, "Technol")] = "Technology"
    
    if (_.indexOf(splittedField, "Natl") != -1 ) 
      splittedField[_.indexOf(splittedField, "Natl")] = "National"
      
      
    if (_.indexOf(splittedField, "Res") != -1 ) 
      splittedField[_.indexOf(splittedField, "Res")] = "Research"
   
    if (_.indexOf(splittedField, "Phys") != -1 ) 
      splittedField[_.indexOf(splittedField, "Phys")] = "Physics"
         
    if (_.indexOf(splittedField, "Acad") != -1 ) {
      
      splittedField[_.indexOf(splittedField, "Acad")] = "Academy"
    }
    if (_.indexOf(splittedField, "Corp") != -1 ) 
      splittedField[_.indexOf(splittedField, "Corp")] = "Corporation"  
    
    if (_.indexOf(splittedField, "\&") != -1 ) 
      splittedField[_.indexOf(splittedField, "\&")] = "and"  
    
    if (_.indexOf(splittedField, "&amp;") != -1 ) 
      splittedField[_.indexOf(splittedField, "&amp;")] = "and"  
      
    if (_.indexOf(splittedField, "Chem") != -1 ) 
      splittedField[_.indexOf(splittedField, "Chem")] = "Chemistry"  
    
    if (_.indexOf(splittedField, "Ctr") != -1 ) 
      splittedField[_.indexOf(splittedField, "Ctr")] = "Center"  
    
    if (_.indexOf(splittedField, "Dept") != -1 ) 
      splittedField[_.indexOf(splittedField, "Dept")] = "Department"  
      
    rawAddress[index] = splittedField.join(" ")
    
    if (rawAddress[index] == "Peoples R China" )
      rawAddress[index] = "China"
  })
  
  console.error(rawAddress.join(","))
  return rawAddress.join(",")
}

stdin(function(data) {
  data = JSON.parse(data)
  
  _.each(data, function(item){
    item.authors.map(function(author) {
      

      for (i = 0; i < author.addresses.length; i++) {
        
        var address = cleanAddress(author.addresses[i])
        var add = {
          address : address
        }
        
        cleanAddressArray.push(add)
      }

    })
  })
  
console.log((JSON.stringify(cleanAddressArray)))
})


  
