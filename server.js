var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// lat, lng (from a client) to request force, neighbourhood form API
app.post('/neighbourhood', function(req,res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.writeHead(200, {"Content-Type": "application/json"});

  var lat = req.body.lat;
  var lng = req.body.lng;
  //console.log("Request Coordinates: " + lat + " : " + lng);

  // GET request using 'request'
  request.get({
    headers: {'Content-Type': 'application/json'},
    url: 'https://data.police.uk/api/locate-neighbourhood?q=' + lat + ',' + lng
  }, function(error, response, body){
    //console.log(body);
    // Return to a client
    res.end(body);
  });
});

// lat, lng (from a client) to request force, neighbourhood form API
app.get('/neighbourhood', function(req,res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.writeHead(200, {"Content-Type": "application/json"});

  var lat = req.query.lat;
  var lng = req.query.lng;
  //console.log("Request Coordinates: " + lat + " : " + lng);

  // GET request using 'request'
  request.get({
    url: 'https://data.police.uk/api/locate-neighbourhood?q=' + lat + ',' + lng
  }, function(error, response, body){
    //console.log(body);
    // Return to a client
    res.send(body);
  });
});


// Neighbourhood full details
app.post('/neighbourhood/details', function(req,res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.writeHead(200, {"Content-Type": "application/json"});

  var force = req.body.force;
  var neighbourhood = req.body.neighbourhood;
  //console.log("Requested: " + force + " | " + neighbourhood);

  // GET request using 'request'
  request.get({
    headers: {'Content-Type': 'application/json'},
    url: 'https://data.police.uk/api/' + force + '/' + neighbourhood
  }, function(error, response, body){
    // Return to a client
    res.end(body);
  });
});


// A list of crime categories and numbers
app.post('/crime-cat-data', function(req,res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.writeHead(200, {"Content-Type": "text/plain"});

  var poly = req.body.poly;
  //console.log(poly);
  //console.log("Requested: Crime categories");

  // GET request using 'request'
  var requests = ['https://data.police.uk/api/crime-categories',
                  'https://data.police.uk/api/crimes-street/all-crime?poly=' + poly];
  var responses = [];
  var categories = [];
  var catCounted = [];
  var index = 0;

    request.get({
      headers: {'Content-Type': 'application/json'},
      url: requests[0]
    }, function(error, response, body){
      responses.push(body);

        var data = JSON.parse(responses[0]);
        //console.log(data);
        for(var i=0; i<data.length; i++) {
          categories.push(data[i].url);
        }

        request.get({
          headers: {'Content-Type': 'application/json'},
          url: requests[1]
        }, function(error, response, body){
          responses.push(body);

          for(var i=0;i<categories.length; i++) {
            catCounted.push({cat: [categories[i]], num: 0});
          }

          var crimeData = JSON.parse(responses[1]);
          //console.log(crimeData);
          // Counting crimes
          for(var i=1;i<crimeData.length; i++) {
            for (var j=0; j<catCounted.length; j++) {
              if (crimeData[i].category == catCounted[j].cat)
              catCounted[j].num += 1;
            }
          }
          // Sorting by number, high to low
          catCounted.sort(function(a, b){
              return b.num-a.num;
          });
          /*
          for(var i=0;i<catCounted.length; i++) {
            console.log("category: " + catCounted[i].cat + " | num: "
              + catCounted[i].num);
          }*/
          // Get back to user!!!
          res.end(JSON.stringify(catCounted));
        });
    });
});

// A list of crime categories and numbers
app.get('/crime-cat-data', function(req,res) {

  var poly = req.query.poly;
  //console.log(poly);
  //console.log("Requested: Crime categories");

  // GET request using 'request'
  var requests = ['https://data.police.uk/api/crime-categories',
                  'https://data.police.uk/api/crimes-street/all-crime?poly=' + poly];
  var responses = [];
  var categories = [];
  var catCounted = [];
  var index = 0;

    request.get({
      headers: {'Content-Type': 'application/json'},
      url: requests[0]
    }, function(error, response, body){
      responses.push(body);

        var data = JSON.parse(responses[0]);
        //console.log(data);
        for(var i=0; i<data.length; i++) {
          categories.push(data[i].url);
        }

        request.get({
          headers: {'Content-Type': 'application/json'},
          url: requests[1]
        }, function(error, response, body){
          responses.push(body);

          for(var i=0;i<categories.length; i++) {
            catCounted.push({cat: [categories[i]], num: 0});
          }

          var crimeData = JSON.parse(responses[1]);
          //console.log(crimeData);
          // Counting crimes
          for(var i=1;i<crimeData.length; i++) {
            for (var j=0; j<catCounted.length; j++) {
              if (crimeData[i].category == catCounted[j].cat)
              catCounted[j].num += 1;
            }
          }
          // Sorting by number, high to low
          catCounted.sort(function(a, b){
              return b.num-a.num;
          });
          /*
          for(var i=0;i<catCounted.length; i++) {
            console.log("category: " + catCounted[i].cat + " | num: "
              + catCounted[i].num);
          }*/
          // Get back to user!!!
          res.send(JSON.stringify(catCounted));
        });
    });
});


/*


*/

app.get('/', function(req,res) {
  res.send("<h1>Hello to CrimeStats!</h1> <br> <h3>To get <b>crime categories</b> and a <b>number of each</b> in the specific area:</h3> <br> " +
            "GET <br> <i>http://crimestatsapi.azurewebsites.net/crime-cat-data?poly=</i>" + " (format of poly: lat,lng:lat,lng:.. whrere the first and the last points are the same)" +
            "<br> POST <br> url: <i>http://crimestatsapi.azurewebsites.net/crime-cat-data</i>" +
            "<br> data: {poly: poly (format of poly: lat,lng:lat,lng:.. whrere the first and the last points are the same)}");
});

var port = process.env.PORT || 1337;
app.listen(port);
