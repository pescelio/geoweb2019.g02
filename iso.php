<?php

// PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
include 'geoweb_pg_open.php';
//echo 'Die Datenbank '.pg_dbname($db).' wurde erfolgreich geöffnet.';

// variable aus js 
php_iso = json_decode($_POST['json']);
var_dump(php_iso);

// zuerst json in db geben, muss man die variable statt dem jetztjson
$insert = "INSERT INTO g02.testisochrone(
WITH data AS (SELECT 'php_iso'
  ::json AS fc)

SELECT
  row_number() OVER () AS gid,
  public.ST_AsText(public.ST_GeomFromGeoJSON(feat->>'geometry')) AS geom,
  feat->'properties' AS properties
FROM (
  SELECT json_array_elements(fc->'features') AS feat
  FROM data
) AS f)"
$result = pg_query($insert);

// Datenbank schliessen
include 'geoweb_pg_close.php';

?>