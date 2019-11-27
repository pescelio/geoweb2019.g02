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


const contr = document.getElementById('control')

//init Map
const map = new Map({
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([16.372, 48.209]),
    zoom: 14
  })
});

// Satelliten-Layer einrichten
const satLayer = new TileLayer({
  source: new XYZ({
    attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: false,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 23
  })
});

const baseLayer = new TileLayer({
  source: new OSM()
});

//Base Layer von OSM hinzufügen
map.addLayer(baseLayer);

// Get the base Sat-Button
const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
  contr.style.color = 'ffffff';                                 // was bewirkt diese funktion?
  //Anderen Layer entfernen
  map.removeLayer(baseLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(satLayer);
});

//Zoom-Buttons
//const zoombuttons = new Zoom(className=zoombuttonoptions);

// Get the base Base-Button
const base = document.getElementById('base');
base.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(satLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(baseLayer);
});

//adds a new vectorlayer for the GPS based locationmark
const GPSmarker = new VectorSource();
const GPSlayer = new VectorLayer({
  source: GPSmarker
});
map.addLayer(GPSlayer);

//gets the GPS-Location and accuracy from the browsers geolocation
//adds point to the layer
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

// Prüft, welcher Radio-Button angewählt ist --> funktioniert nicht
// function getCheckedRadio(startingpoint) {
//   for (let i = 0; i < startingpoint.length; i++) {
//     const button = startingpoint[i];
//     if (button.checked) {
//       return button;
//     }
//   }
//   return undefined;
// }
// const checkedButton_start = getCheckedRadio(document.startingpoint.name);
// if (checkedButton_start) {
//   console.log('The value is ' + checkedButton_start.value);
// }



//Startingpoint Layer 1
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

startLayer1.setZIndex(100); //Damit die Adressmarkierung immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer1);

// Layer für Marker per Klick
map.on('singleclick', function(e) {
  const coords = toLonLat(e.coordinate);
  startSource1.clear(true);
  startSource1.addFeatures([
    new Feature(new Point(fromLonLat(coords)))
  ]);
});


// Eintrag  am aktuellen Standort generieren, bei Klick auf entsprechenden Button
const currentPosition1 = document.getElementById('buttonstart1');

currentPosition1.addEventListener('click', function(event) {
  navigator.geolocation.watchPosition(function(pos) {
    const coords = [pos.coords.longitude, pos.coords.latitude];
    console.log('GPSposition: ' + coords);
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


// Eintrag über Adresssuche generieren
const xhr = new XMLHttpRequest;

// Get the input field
const input = document.getElementById('search');
// Execute a function when the user releases a key on the keyboard
input.addEventListener('keyup', function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();

    startSource1.clear(); // Löscht alle features
    console.log('Input für Suche ist ' + input.value);

    xhr.open('GET', 'https://photon.komoot.de/api/?q=' + input.value + ' Wien'); //input eingeben
    xhr.onload = function() {
      const json = JSON.parse(xhr.responseText);
      const geoJsonReader = new GeoJSON({
        featureProjection: 'EPSG:3857'
      });
      const features = geoJsonReader.readFeatures(json);
      // console.log(features[0]);
      const feature = features[0];
      startSource1.addFeature(feature); //Source Hinzufügen

      // Zoom und Pan auf Suchresultat
      // const ext = feature.getGeometry().getExtent();
      // console.log('Extent des Features ' + ext);
      // map.getView().fit(ext, {maxZoom: 18});
    };
    xhr.send();

  }
});

// sync view of map with the url-hash
sync(map);