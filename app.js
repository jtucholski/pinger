//var DEBUG = true;
var queryString = require('querystring');
var http = require('http');
var fs = require('fs');
var hostUrl = 'requestb.in';
var path = '/z9xoboz9';


// Read in all files (each file represents a route identifier)
// for each file extract the coordinates
// and send the position to a service
readFiles(__dirname, function(filename, data) { 
    var coordinates = processFile(filename, data);
    postPosition(coordinates);
}, 
function(err) { 
    console.log(err);
});


/*
* Reads all text files in a directory.
*/
function readFiles(directory, onFileContent, onError) { 

    fs.readdir(directory, function(err, filenames) { 

        if (err){
            onError(err);
            return;
        } 

        filenames.forEach(function(filename) { 
            if(!filename.endsWith(".txt")) {
                return;
            }

            fs.readFile(directory + '\\' + filename, 'utf-8', function(err, data) {                 
                if(err) {
                    onError(err);
                    return;
                }

                onFileContent(filename.split(".")[0], data);
            });
        });
    });
}

/*
* Processes the file, breaking it up into the latitude, longitude coordinates.
* @routeId The id of the route to reportLocation
* @fileInput The content of the file read in for routeId.
* @returns array of coordinates to report on
*/
function processFile(routeId, fileInput){
    var output = [];
    var coordinates = fileInput.split('\n');
   
    for(var i = 0; i < coordinates.length; i++) {
        var latitude = coordinates[i].split(',')[0];
        var longitude = coordinates[i].split(',')[1];
        var sleepTime = parseInt(coordinates[i].split(',')[2].replace("\r", ""));
        output.push({
            routeId: routeId,
            latitude: latitude,
            longitude: longitude,
            sleepSeconds: sleepTime
        });
    }

    return output;
}

/*
* Updates position of the vehicle along a route by sending coordinates to the API.
*/
function postPosition(coordinates) { 
    var i = 0;

    var reportLocation = function() {
        
        var postData = queryString.stringify({
            'routeId': coordinates[i].routeId,
            'latitude': coordinates[i].latitude,
            'longitude': coordinates[i].longitude,
        });

        var postOptions = {
            hostname: hostUrl,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };        

        console.log(`Reporting Route ${coordinates[i].routeId} at (${coordinates[i].latitude},${coordinates[i].longitude})`);

        // Set up the request
        var postRequest = http.request(postOptions);

        // post the data
        postRequest.write(postData);
        postRequest.end();
        
        setTimeout(reportLocation, coordinates[i].sleepSeconds*1000);

        i = (i == coordinates.length - 1) ? 0 : i+1;        
    }
    
    setTimeout(reportLocation, 1000);
}

/*
* Displays the route out to the console.
*/
function displayRoute(coordinates) { 
    var i = 0;

    var reportLocation = function() {
        console.log();
        console.log(coordinates[i]);
        
        setTimeout(reportLocation, coordinates[i].sleepSeconds*1000);

        i = (i == coordinates.length - 1) ? 0 : i+1;        
    }
    
    setTimeout(reportLocation, 1000);
}