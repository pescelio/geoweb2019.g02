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

// import der funktion für die isochronenabfrage
import {requestIsochrones} from './request.js';


const contr = document.getElementById('control')

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
  contr.style.color = 'ffffff';                             ///// Frage von Elio: was bewirkt diese funktion?
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

      // Zoom und Pan auf Suchresultat
      // const ext = feature.getGeometry().getExtent();
      // console.log('Extent des Features ' + ext);
      // map.getView().fit(ext, {maxZoom: 18});
    };
    xhr.send();

  }
});




///// Ansatz zur Auswahl, der nicht funktioniert hat
///// dieser funktioniert momentan nicht, weil der Wechsel 
///// des Startingpoints nicht dokumentiert wird und immmer auf 2 chekced zurückspringt

// const startSource = startSource1;

// const rbStartingpoint1 = document.getElementById('startingpoint1');
// const rbStartingpoint2 = document.getElementById('startingpoint2');

// console.log(startSource);
// console.log(rbStartingpoint1.checked);

// map.on('singleclick', function(e) {
//   if (rbStartingpoint2.checked = true) {
//     startByClick1(startSource1, e.coordinate);
//   } else {
//     startByClick1(startSource1, e.coordinate);
//   }
// });

// function startByClick1(startSource, e) {
//   // const clickStartSource = startSource;
//   const coords = toLonLat(e);
//   console.log('StartByClick1: ' + coords);
//   startSource.clear(true);
//   startSource.addFeatures([
//     new Feature(new Point(fromLonLat(coords)))
//   ]);
// };

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
