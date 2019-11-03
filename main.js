
//REQUEST
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

function requestIsochrones(coords, mode, range) { //coords, mode, range     Coords: "[[lon1,lat1],[lon2,lat2]]", mode: "cycling-road", "foot-walking", "driving-car", range: seconds
  //Funktion, die einen Request an Openrouteservice sendet, um Isochrone zu den übergebenen Koordinaten abzufragen
  //Returns Array [Status, geojson]
  let request = new XMLHttpRequest();

  request.open('POST', "https://api.openrouteservice.org/v2/isochrones/" + mode);

  request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', '5b3ce3597851110001cf624845c77dc95fb2474598cc727ae494ae11');

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      let status = this.status;
      //console.log('Headers:', this.getAllResponseHeaders());
      let res = this.responseText;
      let response = [status, res];
      console.log(response);
    }
  };

  const body = '{"locations":' + coords + ',"range":[' + range + '],"intersections":"false","location_type":"start","range_type":"time"}';

  request.send(body);
  return response;
}

console.log(requestIsochrones("[[16.369225,48.198129],[16.357001,48.233942]]", "cycling-road", 600));
