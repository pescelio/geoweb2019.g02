<?php

  // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
  include 'geoweb_pg_open.php';
  
  // variable aus js 
  $php_iso = $_POST['res_ueb'];

  $poiCat = $_POST['poiCat'];
  // echo $poiCat;

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

  //verschneiden sich die isochrone?
  $verschneiden ="SELECT ST_Intersects(a.geom, b.geom) from g02.testisochrone a, g02.testisochrone b 
  where a.id<b.id
  And a.id =(SELECT id FROM g02.testisochrone ORDER BY id DESC OFFSET 1 ROW FETCH FIRST 1 ROW ONLY)"; 

  //isochrone verschneiden, polygone speichern

	$intersect = "INSERT INTO g02.testpolygone(geom) 
	select (ST_intersection(a.geom, b.geom)) from g02.testisochrone a, g02.testisochrone b 
	where ST_Intersects(a.geom,b.geom) AND a.id<b.id 
	And a.id=(SELECT id FROM g02.testisochrone ORDER BY id DESC OFFSET 1 ROW FETCH FIRST 1 ROW ONLY)";

  ///srid für iso zurück
  $srid_reset = "SELECT UpdateGeometrySRID('g02','testisochrone','geom',0)";

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
  FROM (SELECT g02.$poiCat.gid, g02.$poiCat.name, g02.$poiCat.geom
      FROM
      g02.$poiCat,
      g02.testpolygone
      WHERE
      g02.testpolygone.id=(Select max(id) FROM g02.testpolygone) AND
      ST_contains(g02.testpolygone.geom, g02.$poiCat.geom)) inputs) features";
 
  $srid_rereset = pg_query($db,$srid_reset) or die ('Fehler bei koordinatensys: '.pg_last_error($db));
  // echo "SRID-Reset: ".$srid_rereset;

  $insert_result = pg_query($db,$insert) or die ('Fehler bei Insert: '.pg_last_error($db));
  // echo "INS-RESULT: ".$insert_result;

  $srid_result = pg_query($db,$srid) or die ('Fehler bei koordinatensys: '.pg_last_error($db));
  // echo "SRID-Result: ".$srid_result


  $intersect_result = pg_query($db, $intersect) or die ('Fehler bei intersect: '.pg_last_error($db));
  
      
  if(pg_affected_rows($intersect_result) == 0) {
    exit();
  }
      
  $pois_result = pg_query($db,$pois) or die ('Fehler bei pois: '.pg_last_error($db));
  // echo "POIS-Result: ".$pois_result;
  
  $pois_pg_result = pg_fetch_array($pois_result);
  // echo "alles gefetched:".$pois_pg_result;
      
  // Erste Zeile des Abfrageergebnisses lesen
  $zeile = pg_fetch_assoc($pois_result);     
        
  $tab = pg_fetch_all($pois_result);
  // echo '<pre>'; print_r($tab); echo '</pre>';
      
  foreach($tab as $k => $a) {
    $tab[$k] = utf8_encode(json_encode($a));
    echo $tab[$k];
  }

  // Datenbank schliessen
  include 'geoweb_pg_close.php';
  // echo "Die Datenbank wurde geschlossen";

  ?>