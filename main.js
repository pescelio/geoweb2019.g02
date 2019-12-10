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


// const rbStartingpoint = document.getElementsByName('startingpoint');
// console.log(rbStartingpoint);
// let startingpoint = "startingpoint1";
// const auswahlStartingpoint = document.getElementsByName('startingpoint');
// console.log('Auswahl' + auswahlStartingpoint);

// for (let x = 0; x < auswahlStartingpoint.length; x++) {
//   auswahlStartingpoint[x].addEventListener('click', function(event) {
//     for (let i = 0; i < rbStartingpoint.length; i++) {
//       if (rbStartingpoint[i].checked) {
//         startingpoint = rbStartingpoint[i].value;
//       }
//     }
//   });
// };
// console.log('der Ausgewählte Startingpoint ist ' + startingpoint);

// Prüft, welcher Radio-Button angewählt ist --> funktioniert nicht
// function getCheckedRadio(startingpoint) {
//   for (let i = 0; i < startingpoint.length; i++) {
//     const button = startingpoint[i];
//     if (button.checked) {
//       console.log(button);
//       return button;
//     }
//   }
//   console.log(startingpoint);
//   return undefined;
// }



// const checkedButton_start = getCheckedRadio(document.startingpoint.name);
// console.log(document.startingpoint.name);
// if (checkedButton_start) {
//   console.log('The value is ' + checkedButton_start.value);
// } else {
// console.log('Hat nicht funktioniert!');
//}



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

startLayer1.setZIndex(100); //Damit die Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer1);

//Startingpoint Layer 2
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

startLayer2.setZIndex(100); //Damit der Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer2);

let startSource = startSource1;


//////////////////////////////
// Marker per Klick in Karte
//////////////////////////////

function startByClick(startSource) {
  // const clickStartSource = startSource;
  map.on('singleclick', function(e) {
    const coords = toLonLat(e.coordinate);
    console.log('StartByClick: ' + startSource + coords);
    startSource.clear(true);
    startSource.addFeatures([
      new Feature(new Point(fromLonLat(coords)))
    ]);
  });
};

function startByClick1(startSource, e) {
  // const clickStartSource = startSource;
  const coords = toLonLat(e);
  console.log('StartByClick1: ' + coords);
  startSource.clear(true);
  startSource.addFeatures([
    new Feature(new Point(fromLonLat(coords)))
  ]);
};


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
      startSource1.addFeature(feature); 
      console.log('GPS-Position der Adresse suche ist: ' + feature); //Source Hinzufügen

      // Zoom und Pan auf Suchresultat
      // const ext = feature.getGeometry().getExtent();
      // console.log('Extent des Features ' + ext);
      // map.getView().fit(ext, {maxZoom: 18});
    };
    xhr.send();

  }
});

////////////////////////////
//Versuche, die Auswahl des Ergebnislayers 
//über die Radiobuttons zu steuern
////////////////////////////


/////Ansatz 1
// const rbStartingpoint2 = document.getElementById('startingpoint2');
// rbStartingpoint2.addEventListener('click', function() {
//   startSource = startSource2;
//   console.log(startSource);
//   startByClick(startSource);
// });



// const rbStartingpoint1 = document.getElementById('startingpoint1');
// rbStartingpoint1.addEventListener('click', function() {
//   startSource = startSource1;
//   console.log(startSource);
//   startByClick(startSource);
// });

/////Ansatz 2

const rbStartingpoint1 = document.getElementById('startingpoint1');

console.log(startSource);
console.log(rbStartingpoint1.checked);

map.on('singleclick', function(e) {
  if (rbStartingpoint1.checked = true) {
    startByClick1(startSource1, e.coordinate);
  } else {
    startByClick1(startSource2, e.coordinate);
  }
});

// sync view of map with the url-hash
sync(map);

// GPS-Standort in Startingpoint-Layer 1 erzeugen
document.getElementById('buttonstart1').addEventListener('click', function(event) {
  navigator.geolocation.watchPosition(function(pos) {
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
  navigator.geolocation.watchPosition(function(pos) {
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
