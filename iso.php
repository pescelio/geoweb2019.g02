<?php

  // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
  include 'geoweb_pg_open.php';
  
  // variable aus js 
  $php_iso = $_POST['res_ueb'];

  //$poiCat = $_POST['poiCat'];
  $poiCat = "cafe";
  // echo $poiCat;

  //echo "<----------->";

  // damit jeweils die richtigen Einträge bentutzt werden, 
  // sollten wir wohl noch eine Laufnummer oder etwas ähnliches erzeugen
  // alternativ könnte evt. auch der wert des Timestamps in den Metadaten verwendet werden
  // (was aber potenziell falsche lösungen ergeben könnte (genau gleichzeitige Anfragen))
  // der Timestamp müsste zusätzlich als separater Wert in die Datenbank geschrieben werden

  // Zudem muss die Art des Treffpunkts hier ebenfalls noch übergeben werden


  // Diese Abschnitte sind nicht notwendig, da das JSON anscheinend schon im richtigen Format übergeben wird
  //echo "<------------------------------------------------------------------->";
  //$php_iso = json_decode($php_iso);
  // echo 'JSON-Decode: ';
  // echo $php_iso;

  // function console_log($php_iso, $with_script_tags = true) {
  //   $js_code = 'console.log(' . json_encode($php_iso, JSON_HEX_TAG) . 
  //   ');';
  //     if ($with_script_tags) {
  //         $js_code = '<script>' . $js_code . '</script>';
  //     }
  //     echo $js_code;
  // }

  // zuerst json in db geben
  $insert = "INSERT INTO g02.testisochrone(
  WITH data AS (SELECT '$php_iso'
    ::json AS fc)

  SELECT
    row_number() OVER () AS gid,
    public.ST_AsText(public.ST_GeomFromGeoJSON(feat->>'geometry')) AS geom,
    feat->'properties' AS properties
  FROM (
    SELECT json_array_elements(fc->'features') AS feat
    FROM data
  ) AS f)";

	///srid für isochrone definiern
	$srid = "SELECT UpdateGeometrySRID('g02','testisochrone','geom',4326)";

	//isochrone verschneiden, polygone speichern

	$intersect = "INSERT INTO g02.testpolygone(geom) 
	select (ST_intersection(a.geom, b.geom)) from g02.testisochrone a, g02.testisochrone b 
	where ST_Intersects(a.geom,b.geom) AND a.id<b.id 
	And a.id=(SELECT id FROM g02.testisochrone ORDER BY id DESC OFFSET 1 ROW FETCH FIRST 1 ROW ONLY)";

	// pois im polygon aussuchen
	
	// die poiCat variablen: option value="restaurant" name="poiCat" checked>Restaurant</option>
  //   <option value="cafe" name="poiCat">Cafe</option>
  //   <option value="bar" name="poiCat">Bar</option>
  //   <option value="park" name="poiCat">Park</option>

  ///srid für iso zurück
  $srid_reset = "SELECT UpdateGeometrySRID('g02','testisochrone','geom',0)";

	/*$pois = "SELECT g02.$poiCat.* 
	FROM
	g02.$poiCat,
	g02.testpolygone 
	WHERE
	g02.testpolygone.id=(Select max(id) FROM g02.testpolygone) AND
  ST_contains(g02.testpolygone.geom, g02.$poiCat.geom)";*/ 
  
  //Variablen mit Null-Werten funktionieren nicht
  /*$pois = "SELECT g02.$poiCat.name,  g02.$poiCat.addr_stree, ST_astext(g02.$poiCat.geom)
  FROM
  g02.$poiCat,
  g02.testpolygone
  WHERE
  g02.testpolygone.id=(Select max(id) FROM g02.testpolygone) AND
  ST_contains(g02.testpolygone.geom, g02.$poiCat.geom)";*/

  $pois = "SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(features.feature)
  )
  FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         gid,
    'geometry',   ST_AsGeoJSON(geom)::jsonb,
    'properties', to_jsonb(inputs) -'geom'
  ) AS feature
  FROM (SELECT g02.$poiCat.gid, g02.$poiCat.name,  g02.$poiCat.addr_stree, g02.$poiCat.geom
      FROM
      g02.$poiCat,
      g02.testpolygone
      WHERE
      g02.testpolygone.id=(Select max(id) FROM g02.testpolygone) AND
      ST_contains(g02.testpolygone.geom, g02.$poiCat.geom)) inputs) features";
  
  
	 
// st_AsGeoJSON fehlt noch
 
  $srid_rereset = pg_query($db,$srid_reset) or die ('Fehler bei koordinatensys: '.pg_last_error($db));
  echo "SRID-Reset: ".$srid_rereset;

  $insert_result = pg_query($db,$insert) or die ('Fehler bei Insert: '.pg_last_error($db));
  echo "INS-RESULT: ".$insert_result;

  $srid_result = pg_query($db,$srid) or die ('Fehler bei koordinatensys: '.pg_last_error($db));
  echo "SRID-Result: ".$srid_result;

  $intersect_result = pg_query($db, $intersect) or die ('Fehler bei intersect: '.pg_last_error($db));
  echo "INTERSECT-Result: ".$intersect_result;
    
  $pois_result = pg_query($db,$pois) or die ('Fehler bei pois: '.pg_last_error($db));
  echo "POIS-Result: ".$pois_result;
  $pois_pg_result = pg_fetch_array($pois_result);
  echo "alles gefetched:".$pois_pg_result;


  // zeilen- und Spaltenanzahl des Abfrageergebnisses anzeigen
  echo '<p>Das Abfrageergebnis hat '.pg_num_rows($pois_result).' Zeilen und '.
  pg_num_fields($pois_result).' Spalten.</p>';

  // Erste Zeile des Abfrageergebnisses lesen
  $zeile = pg_fetch_assoc($pois_result); 

  // Erste Zeile (in assoziativem Array) verarbeiten
  echo '<p>Die 1. Zeile ist: '.$zeile["iu"]. 
  '  '.$zeile["iuiuih"].'</p>';

  // Oder gleich alle Zeilen in assoziatives Array laden
  echo '<p>Es können auch alle Zeilen übertragen und mal unlayoutiert angezeigt werden:</p>';
  $tab = pg_fetch_all($pois_result);
  echo '<pre>'; print_r($tab); echo '</pre>';

  foreach($tab as $k => $a) {
    $tab[$k] = json_encode($a);
    echo $tab[$k];
  }

  echo "After foreach-loop: ".$tab;

  //$json_pois = json_encode($pois_pg_result, JSON_THROW_ON_ERROR);
  //echo "json encode:".$json_pois;
  
  // Hier müssen die Isochrone verschnitten werden
  // und die Abfrage der Amenities gemacht werden


  // Datenbank schliessen
  include 'geoweb_pg_close.php';
  echo "Die Datenbank wurde geschlossen";

  ?>