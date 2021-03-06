import 'ol/ol.css';

//Allg
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import sync from 'ol-hashed';
import Overlay from 'ol/Overlay';


// Layers
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';


//Sources
import Vector from 'ol/source/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Stamen from 'ol/source/Stamen';

//Format
import GeoJSON from 'ol/format/GeoJSON';

//Style
import {Icon, Style} from 'ol/style';
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

// // jQuery
// import $ from 'jQuery';
// window.jQuery = window.$ = $;

// $(selector).hide();

let view = new View({
  center: olProj.fromLonLat([16.372, 48.209]),
  zoom: 14
})

//init Map
const map = new Map({
  target: 'map',
  view: view
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
  source: new Stamen({
    attributions: ['Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.', 'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'],
    attributionsCollapsible: false,
    layer: 'toner-lite'
  })
});

map.addLayer(baseLayer);

// Get the base Sat-Button
const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
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

// //adds a new vectorlayer for the GPS based locationmark
// const GPSmarker = new VectorSource();
// const GPSlayer = new VectorLayer({
//   source: GPSmarker
// });
// map.addLayer(GPSlayer);

// adds Layer für Startpunkt 1
const startSource1 = new Vector();
const startLayer1 = new VectorLayer({
  source: startSource1
});

startLayer1.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 30],
    scale: 0.25,
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'icons/startpoint.png'
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
  image: new Icon({
    anchor: [0.5, 30],
    scale: 0.25,
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'icons/startpoint.png'
  })
}));

startLayer2.setZIndex(101); //Damit der Layer immer zu sehen ist und nicht von anderen Layern verdeckt wird
map.addLayer(startLayer2);

// adds Layer für Isochrone
const isoSource = new Vector();

const isoLayer = new VectorLayer({
  source: isoSource
});

isoLayer.setZIndex(50);
map.addLayer(isoLayer);

isoLayer.setStyle(new Style({
  fill: new Fill({
    color: 'rgba(235, 91, 12, 0.2)'
  }),
  stroke: new Stroke({
    color: 'rgba(235, 91, 12, 1 )',
    width: 1.25
  })
}));

// add Layer for POIs

const poiSource = new Vector();

const poiLayer = new VectorLayer({
  source: poiSource
});

poiLayer.setZIndex(150);
map.addLayer(poiLayer);


//////////////////////////
//gets the GPS-Location and accuracy from the browsers geolocation
//adds point to the layer
//////////////////////////
// navigator.geolocation.watchPosition(function(pos) {
//   const coords = [pos.coords.longitude, pos.coords.latitude];
//   const accuracy = circular(coords, pos.coords.accuracy);
//   GPSmarker.clear(true);
//   GPSmarker.addFeatures([
//     new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
//     new Feature(new Point(fromLonLat(coords)))
//   ]);
// }, function(error) {
//   alert(`ERROR: ${error.message}`);
// }, {
//   enableHighAccuracy: true
// });


////////////////////////////
// Auswahl der Modalität
////////////////////////////
const modes = document.getElementsByName('mobility');
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
// Auswahl der Treffpunkt-Kategorie
////////////////////////////
const poiCat = document.getElementsByName('poiCat');
let poiCat_value = 'restaurants';
for (let i = 0; i < poiCat.length; i++) {
  poiCat[i].addEventListener('click', function() {
    for (let i = 0; i < poiCat.length; i++) {
      if (poiCat[i].checked) {
        poiCat_value = poiCat[i].value;
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

const overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10],
  autoPan: true
});
map.addOverlay(overlay);

const closer = document.getElementById('popup-closer');

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

//////////////////////////////
// Veränderung Mauszeiger bei Hover über POI
//////////////////////////////

map.on('pointermove', (e) => {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel, {
    layerFilter: (l) => l === poiLayer 
  });
  document.getElementById('map').style.cursor = hit ? 'pointer' : '';
});

//////////////////////////////
// Marker per Klick in Karte setzen
//////////////////////////////

map.on('singleclick', function(e) {
  // hier prüfen, ob schon ein feature da liegt
  document.getElementById('popup-container').style.display = 'none';

  const hit = map.hasFeatureAtPixel(e.pixel, {
    layerFilter: (l) => l === poiLayer 
  });


  if (hit) {
    view.animate({center: e.coordinate}, {zoom: 17}, {duration: 500});
    // map.getView().setZoom(map.getView().getZoom()+1);
    let markup = ''; // the variable "markup" is html code, as string
    if (map.getView().getZoom() === 17) {
      document.getElementById('popup-container').style.display = 'block';
      map.forEachFeatureAtPixel(e.pixel, function(feature) {
        const properties = feature.getProperties();
        markup += markup + '<p>';
        for (const property in properties) {
          if (property === 'name') {
            markup += properties[property];
          }
        }
        markup += '</p>';
      }, {
        layerFilter: (l) => l === poiLayer 
      });
      if (markup) { // if any table was created (= feature already existed at clicked point)
        setTimeout(function() {
          document.getElementById('popup-content').innerHTML = markup;
          overlay.setPosition(e.coordinate);
        }, 550);
      }
    }

  } else {
    // wenn kein feature da liegt, den punkt setzen
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
    // console.log('Koordinaten des Klicks sind: ' + coords);
    // Hier die Koordinaten für den Isochrone-Request übergeben (via funktionsaufruf)?
  }

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
    // console.log('Input für Suche ist ' + input.value);

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
      if (startSource === startSource1) {
        coords1 = coords;
      } else {
        coords2 = coords;
      }

      // console.log('Koordinaten der Adressesuche sind: ' + coords);


      // wir müssen noch prüfen, ob die Adresssuche ein resultat liefert

    };
    xhr.send();

  }
});

////////////////////////////
// GPS-Standort für Auswahl des Startpunkts verwenden
////////////////////////////

// // GPS-Standort in Startingpoint-Layer 1 erzeugen
// document.getElementById('buttonstart1').addEventListener('click', function(event) {
//   navigator.geolocation.getCurrentPosition(function(pos) {
//     const coords = [pos.coords.longitude, pos.coords.latitude];
//     coords1 = coords;
//     // console.log('GPSposition 1: ' + coords);
//     startSource1.clear(true);
//     startSource1.addFeatures([
//       new Feature(new Point(fromLonLat(coords)))
//     ]);
//   }, function(error) {
//     alert(`ERROR: ${error.message}`);
//   }, {
//     enableHighAccuracy: true
//   });
// });


// // Eintrag am aktuellen Stanodort in Startingpoint-Layer 2 erzeugen
// document.getElementById('buttonstart2').addEventListener('click', function(event) {
//   navigator.geolocation.getCurrentPosition(function(pos) {
//     const coords = [pos.coords.longitude, pos.coords.latitude];
//     coords2 = coords;
//     // console.log('GPSposition 2: ' + coords);
//     startSource2.clear(true);
//     startSource2.addFeatures([
//       new Feature(new Point(fromLonLat(coords)))
//     ]);
//   }, function(error) {
//     alert(`ERROR: ${error.message}`);
//   }, {
//     enableHighAccuracy: true
//   });
// });

/////////////////
// Get the go-Button
/////////////////
const go = document.getElementById('go-button');
go.addEventListener('click', function(event) {
  //Funktionsaufruf um die Abfrage zu starten
  const coord_value = [coords1, coords2];
  const coord_str = JSON.stringify(coord_value);
  // console.log('STRINGIFY: ' + coord_str);
  document.getElementById('popup-container').style.display = 'none';
  requestIsochrones(coord_str, mode_value, time_value);
  //'[[16.369225,48.198129],[16.357001,48.233942]]'
});

///////////////////
// Fügt die Isochrone zum Isochronen-Layer hinzu
// übergibt die Isochrone und weitere Infos an den Server
///////////////////

function returnResult(res) {
  isoSource.clear(true);
  // console.log(res);

  // const test_coords = [16.372, 48.209];

  isoSource.addFeatures(
    new GeoJSON({featureProjection: 'EPSG:3857'}).readFeatures(res)
  );

  //hier muss die weitere Datenverarbeitung bzw. die Kommunikation mit der Datenbank stattfinden
  const res_ueb = 'res_ueb=' + res + '&poiCat=' + poiCat_value; // JSON.stringify(res);

  // console.log(res_ueb);

  const requestDB = new XMLHttpRequest();
  requestDB.open('POST', 'iso.php', true);
  requestDB.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //In diesem Format werden die Werte in der gleichen Form übergeben wir in der URL in der GET-Methode
  requestDB.send(res_ueb);

  requestDB.onreadystatechange = function() {
    // console.log('Status: ' + this.status);
    poiSource.clear(true);

    if (this.responseText != '' && this.readyState === 4) {
      // console.log('Headers:', this.getAllResponseHeaders());
      // hier noch die

      // console.log(this.responseText);

      if (this.responseText !== ' ') {
        const response = JSON.parse(this.responseText);
        // console.log(response);

        const POI = response.jsonb_build_object;
        //console.log('response ' + POI);

        poiLayer.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 30],
            scale: 0.6,
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'icons/' + poiCat_value + '.png'
          })
        }));

        poiSource.addFeatures(
          new GeoJSON({featureProjection: 'EPSG:3857'}).readFeatures(POI)
        );
      } else {
        return;
      }


      // console.log('Stringify: ' + JSON.stringify(response));
    }
  };

}

///////////////////
//Funktion, die einen Request an Openrouteservice sendet, um Isochrone zu den übergebenen Koordinaten abzufragen
//gibt Isochrone an die Funktion returnResult() weiter, welche dann die Kommunikation mit der Datenbank übernimmt
///////////////////
function requestIsochrones(coords, mode, range) {
  //coords, mode, range     Coords: "[[lon1,lat1],[lon2,lat2]]", mode: "cycling-road", "foot-walking", "driving-car", range: seconds

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
