<?php

  // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
  include 'geoweb_pg_open.php';
  echo 'Die Datenbank '.pg_dbname($db).' wurde erfolgreich geöffnet.';

  echo "<------------------------------------------------------------------>";

  // variable aus js 
  $php_iso = $_POST['res_ueb'];
  
  echo $php_iso;

  echo "<----------->";

  $php_iso = $_POST['poiCat'];

  echo $poiCat;

  echo "<----------->";


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



  $result = pg_query($db,$insert) or die ('Fehler bei Speichern: '.pg_last_error($db));
  echo $result;

  // Hier müssen die Isochrone verschnitten werden
  // und die Abfrage der Amenities gemacht werden


  // Datenbank schliessen
  include 'geoweb_pg_close.php';
  echo "Die Datenbank wurde geschlossen";

  ?>