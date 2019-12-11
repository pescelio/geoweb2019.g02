function returnResult(res) {
  //hier muss die weitere Datenverarbeitung bzw. die Kommunikation mit der Datenbank stattfinden
  console.log(res);
  map.addLayer(isoLayer);
}

function requestIsochrones(coords, mode, range) { //coords, mode, range     Coords: "[[lon1,lat1],[lon2,lat2]]", mode: "cycling-road", "foot-walking", "driving-car", range: seconds
  //Funktion, die einen Request an Openrouteservice sendet, um Isochrone zu den übergebenen Koordinaten abzufragen
  //gibt Isochrone an die Funktion returnResult() weiter, welche dann die Kommunikation mit der Datenbank übernimmt

  const request = new XMLHttpRequest();

  request.open('POST', 'https://api.openrouteservice.org/v2/isochrones/' + mode);

  request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', '5b3ce3597851110001cf624845c77dc95fb2474598cc727ae494ae11');

  const body = '{"locations":' + coords + ',"range":[' + range + '],"intersections":"false","location_type":"start","range_type":"time"}';

  request.send(body);

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      // const status = this.status;
      // console.log('Headers:', this.getAllResponseHeaders());
      const isochrone = this.responseText;
      returnResult(isochrone);
    }
  };
}

// funktion über export bereitstellen
export {requestIsochrones};
