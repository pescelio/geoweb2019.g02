import 'ol/ol.css';

//Allg
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import sync from 'ol-hashed';

// Layers
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

//Sources
import Vector from 'ol/source/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';

//Format
import GeoJSON from 'ol/format/GeoJSON';

//Style
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';

//Proj
import * as olProj from 'ol/proj';
import {fromLonLat, toLonLat} from 'ol/proj';

//geom
import Point from 'ol/geom/Point';
import {circular} from 'ol/geom/Polygon';

//control
import Zoom from 'ol/control/Zoom';

const contr = document.getElementById('control');

//init Map
const map = new Map({
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([16.372, 48.209]),
    zoom: 14
  })
});

// sync view of map with the url-hash
sync(map);

// Satelliten-Layer einrichten
const satLayer = new TileLayer({
  source: new XYZ({
    attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: false,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 23
  })
});


//Base Layer von OSM hinzufügen
const baseLayer = new TileLayer({
  source: new OSM()
});
map.addLayer(baseLayer);

// Get the base Sat-Button
const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
  contr.style.color = 'ffffff';             ///// Frage von Elio: was bewirkt diese funktion?
  //Anderen Layer entfernen
  map.removeLayer(baseLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(satLayer);
});

// Get the base Base-Button
const base = document.getElementById('base');
base.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(satLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(baseLayer);
});

//Zoom-Buttons
//const zoombuttons = new Zoom(className=zoombuttonoptions);

//adds a new vectorlayer for the GPS based locationmark
const GPSmarker = new VectorSource();
const GPSlayer = new VectorLayer({
  source: GPSmarker
});
map.addLayer(GPSlayer);

// adds Layer für Startpunkt 1
const startSource1 = new Vector();
const startLayer1 = new VectorLayer({
  source: startSource1
});

startLayer1.setStyle(new Style({
  image: new Circle({
    fill: new Fill({
      color: 'rgba(255,0,0,0.4)'
    }),
    stroke: new Stroke({
      color: '#ff0000',
      width: 1.25
    }),
    radius: 15
  })
}));

startLayer1.setZIndex(100); //Damit die Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer1);

// adds Layer für Startpunkt 2
const startSource2 = new Vector();
const startLayer2 = new VectorLayer({
  source: startSource2
});

startLayer2.setStyle(new Style({
  image: new Circle({
    fill: new Fill({
      color: 'rgba(0,255,0,0.4)'
    }),
    stroke: new Stroke({
      color: '#00ff00',
      width: 1.25
    }),
    radius: 15
  })
}));

startLayer2.setZIndex(101); //Damit der Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer2);


//////////////////////////
//gets the GPS-Location and accuracy from the browsers geolocation
//adds point to the layer
//////////////////////////
navigator.geolocation.watchPosition(function(pos) {
  const coords = [pos.coords.longitude, pos.coords.latitude];
  const accuracy = circular(coords, pos.coords.accuracy);
  GPSmarker.clear(true);
  GPSmarker.addFeatures([
    new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
    new Feature(new Point(fromLonLat(coords)))
  ]);
}, function(error) {
  alert(`ERROR: ${error.message}`);
}, {
  enableHighAccuracy: true
});


////////////////////////////
// Auswahl der Modlität
////////////////////////////
const modes = document.getElementsByName('mobility')
let mode_value = 'foot-walking';
for (let i = 0; i < modes.length; i++) {
  modes[i].addEventListener('click', function() {
    for (let i = 0; i < modes.length; i++) {
      if (modes[i].checked) {
        mode_value = modes[i].value;
      }
    }
  });
}

////////////////////////////
// Auswahl der zeit
////////////////////////////
const times = document.getElementsByName('time');
let time_value = 600;
for (let i = 0; i < times.length; i++) {
  times[i].addEventListener('click', function() {
    for (let i = 0; i < times.length; i++) {
      if (times[i].checked) {
        time_value = times[i].value;
      }
    }
  });
}


let coords1 = [];
let coords2 = [];

////////////////////////////
// Auswahl des Startpunkts über die Radiobuttons steuern
////////////////////////////

let startSource = startSource1;
const rbStartingpoint2 = document.getElementById('startingpoint2');
rbStartingpoint2.addEventListener('click', function() {
  startSource = startSource2;
});

const rbStartingpoint1 = document.getElementById('startingpoint1');
rbStartingpoint1.addEventListener('click', function() {
  startSource = startSource1;
});

//////////////////////////////
// Marker per Klick in Karte setzen
//////////////////////////////

map.on('singleclick', function(e) {
  const coords = toLonLat(e.coordinate);
  if (startSource === startSource1) {
    coords1 = coords;
  } else {
    coords2 = coords;
  }
  startSource.clear(true);
  startSource.addFeatures([
    new Feature(new Point(fromLonLat(coords)))
  ]);
  //console.log(startSource);
  console.log('Koordinaten des Klicks sind: ' + coords);
  // Hier die Koordinaten für den Isochrone-Request übergeben (via funktionsaufruf)?

});


//////////////////////////////
// Eintrag über Adresssuche generieren
//////////////////////////////

const xhr = new XMLHttpRequest;

// Get the input field
const input = document.getElementById('search');
// Execute a function when the user releases a key on the keyboard
input.addEventListener('keyup', function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();

    startSource.clear(); // Löscht alle features
    console.log('Input für Suche ist ' + input.value);

    xhr.open('GET', 'https://photon.komoot.de/api/?q=' + input.value + ' Wien'); //input eingeben
    xhr.onload = function() {
      const json = JSON.parse(xhr.responseText);
      const geoJsonReader = new GeoJSON({
        featureProjection: 'EPSG:3857'
      });
      const features = geoJsonReader.readFeatures(json);
      const feature = features[0];
      startSource.addFeature(feature); //Source Hinzufügen
      // Defintion der Koordinaten der Adresssuche
      const coords = [feature.values_.extent[0], feature.values_.extent[1]];
      console.log('Koordinaten der Adressesuche sind: ' + coords);


      // wir müssen noch prüfen, ob die Adresssuche ein resultat liefert

    };
    xhr.send();

  }
});

////////////////////////////
// GPS-Standort für Auswahl des Startpunkts verwenden
////////////////////////////

// GPS-Standort in Startingpoint-Layer 1 erzeugen
document.getElementById('buttonstart1').addEventListener('click', function(event) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    const coords = [pos.coords.longitude, pos.coords.latitude];
    console.log('GPSposition 1: ' + coords);
    startSource1.clear(true);
    startSource1.addFeatures([
      new Feature(new Point(fromLonLat(coords)))
    ]);
  }, function(error) {
    alert(`ERROR: ${error.message}`);
  }, {
    enableHighAccuracy: true
  });
});


// Eintrag am aktuellen Stanodort in Startingpoint-Layer 2 erzeugen
document.getElementById('buttonstart2').addEventListener('click', function(event) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    const coords = [pos.coords.longitude, pos.coords.latitude];
    console.log('GPSposition 2: ' + coords);
    startSource2.clear(true);
    startSource2.addFeatures([
      new Feature(new Point(fromLonLat(coords)))
    ]);
  }, function(error) {
    alert(`ERROR: ${error.message}`);
  }, {
    enableHighAccuracy: true
  });
});


// Get the go-Button
const go = document.getElementById('go-button');
go.addEventListener('click', function(event) {
  //Funktionsaufruf um die Abfrage zu starten
  let coord_value = [coords1, coords2];
  let coord_str = JSON.stringify(coord_value);
  console.log("STRINGIFY: " + coord_str);
  console.log(coord_value);

  requestIsochrones(coord_str, mode_value, time_value);
  //'[[16.369225,48.198129],[16.357001,48.233942]]'
});

// adds Layer für Isochrone
const isoSource = new VectorSource({
  features: (new GeoJSON()).readFeatures({"type":"FeatureCollection","bbox":[16.347938,48.204282,16.38719,48.231928],"features":[{"type":"Feature","properties":{"group_index":0,"value":600.0,"center":[16.377293932526754,48.22561621954702]},"geometry":{"coordinates":[[[16.368497,48.226895],[16.368694,48.225685],[16.368811,48.225345],[16.370881,48.221256],[16.371108,48.220977],[16.375467,48.220135],[16.379525,48.219917],[16.384031,48.221213],[16.384207,48.221262],[16.384254,48.221283],[16.387021,48.224338],[16.387057,48.224415],[16.38719,48.22475],[16.387048,48.227159],[16.386881,48.227479],[16.381286,48.228871],[16.37926,48.230739],[16.379124,48.230908],[16.37899,48.231075],[16.378785,48.231338],[16.378579,48.231601],[16.376429,48.231928],[16.374677,48.231315],[16.373005,48.230603],[16.37024,48.229086],[16.36969,48.228592],[16.368497,48.226895]]],"type":"Polygon"}},{"type":"Feature","properties":{"group_index":1,"value":600.0,"center":[16.35735146245483,48.21094612650178]},"geometry":{"coordinates":[[[16.347938,48.211851],[16.348047,48.209527],[16.349293,48.207766],[16.351317,48.206142],[16.353017,48.205405],[16.353576,48.205195],[16.356658,48.204282],[16.35858,48.204531],[16.361701,48.205228],[16.363279,48.206414],[16.363914,48.207059],[16.364131,48.207346],[16.36576,48.211712],[16.365467,48.213708],[16.36531,48.214169],[16.365145,48.214489],[16.363883,48.21567],[16.362568,48.216921],[16.359776,48.217644],[16.35876,48.217818],[16.357796,48.217785],[16.356316,48.217688],[16.351155,48.215098],[16.347973,48.21221],[16.347938,48.211851]]],"type":"Polygon"}}],"metadata":{"attribution":"openrouteservice.org | OpenStreetMap contributors","service":"isochrones","timestamp":1576077905711,"query":{"locations":[[16.37729098629565,48.22563566262315],[16.35734243878096,48.210947314177616]],"location_type":"start","range":[600.0],"range_type":"time","intersections":false},"engine":{"version":"5.0.2","build_date":"2019-11-14T09:52:07Z"}}})
});
const isoLayer = new VectorLayer({
  source: isoSource
});

// isoLayer.setStyle(new Style({
//   image: new Circle({
//     fill: new Fill({
//       color: 'rgba(0,255,0,0.4)'
//     }),
//     stroke: new Stroke({
//       color: '#00ff00',
//       width: 1.25
//     }),
//     radius: 15
//   })
// }));



isoLayer.setZIndex(1000); //Damit der Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(isoLayer);

function returnResult(res) {
  // isoSource.clear(true);
  //
  //
  // isoSource.addFeatures([
  //   new GeoJSON().readFeatures(res)
  // ]);

  //hier muss die weitere Datenverarbeitung bzw. die Kommunikation mit der Datenbank stattfinden
  console.log(res);
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
