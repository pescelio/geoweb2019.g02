<?php

  // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
  include 'geoweb_pg_open.php';
  echo 'Die Datenbank '.pg_dbname($db).' wurde erfolgreich geöffnet.';

  echo "<------------------------------------------------------------------>";

  
  // $php_iso = json_decode($_POST['res_str']);
  

  // echo"<br />";


  // variable aus js 
  $php_iso = $_POST['res_ueb'];
  echo 'inhalt des übergebenen Arrays: ';

  print_r ($php_iso);

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

	//isochrone verschneiden, polygone speichern

	$intersect = "insert into g02.testpolygone(geom) 
	select (ST_intersection(a.geom, b.geom)) from g02.testisochrone a, g02.testisochrone b 
	where ST_Intersects(a.geom,b.geom) AND a.id<b.id 
	And a.id=(SELECT id FROM g02.testisochrone ORDER BY id DESC OFFSET 1 ROW FETCH FIRST 1 ROW ONLY)";

	//srid für polygone definiern
	$srid = "SELECT UpdateGeometrySRID('g02','testpolygone','geom',4326)";

	// pois im polygon aussuchen
	
	// die cat variablen????????????????????????

	$pois = "SELECT g02.restaurants.* 
	FROM
	g02.restaurants,
	g02.testpolygone 
	WHERE
	g02.testpolygone.id=(Select max(id) FROM g02.testpolygone) AND
	ST_contains(g02.testpolygone.geom, g02.restaurants.geom)";
	 



  $result = pg_query($db,$insert,$intersect,$srid,$pois) or die ('Fehler bei Speichern: '.pg_last_error($db));
  echo $result;

  // Hier müssen die Isochrone verschnitten werden
  // und die Abfrage der Amenities gemacht werden


  // Datenbank schliessen
  include 'geoweb_pg_close.php';
  echo "Die Datenbank wurde geschlossen";

  ?>