var queryString = require('querystring');
var fs = require('fs');

fs.readFile("route-1.txt", "utf-8", function(err, data) { 

    if (err){
        console.log(err);
    }

    var coordinates = processFile(data);
    driveRoute(coordinates);

});


function processFile(fileInput){
    
    var output = [];
    var coordinates = fileInput.split('\n');
    for(var i = 0; i < coordinates.length; i++) {
        var latitude = coordinates[i].split(',')[0];
        var longitude = coordinates[i].split(',')[1];
        var sleepTime = parseInt(coordinates[i].split(',')[2].replace("\r", ""));
        output.push({
            latitude: latitude,
            longitude: longitude,
            sleepSeconds: sleepTime
        });
    }

    return output;
}


function driveRoute(coordinates) { 
    var i = 0;

    var reportLocation = function() {
        console.log();
        console.log(coordinates[i]);
        
        setTimeout(reportLocation, coordinates[i].sleepSeconds*1000);

        i = (i == coordinates.length - 1) ? 0 : i+1;        
    }
    
    setTimeout(reportLocation, 1000);
}



