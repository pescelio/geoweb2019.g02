<html>
  <head></head>
  <body>

  
  <p>Hallo welt</p>
    <form method="POST" action="iso.php">
      <input type="textarea" name="res" value='{"type":"FeatureCollection","bbox":[16.348232,48.203054,16.378533,48.218246],"features":[{"type":"Feature","properties":{"group_index":0,"value":600.0,"center":[16.358402178251794,48.210767616572255]},"geometry":{"coordinates":[[[16.348232,48.211822],[16.350133,48.209307],[16.352563,48.20627],[16.354039,48.205458],[16.356419,48.204907],[16.357597,48.204689],[16.358281,48.204752],[16.361753,48.205191],[16.364551,48.206533],[16.364812,48.206685],[16.365795,48.208076],[16.367297,48.210849],[16.36743,48.211698],[16.366488,48.214563],[16.365916,48.215718],[16.36386,48.217519],[16.362178,48.217761],[16.360469,48.217976],[16.358456,48.218246],[16.356305,48.217707],[16.351231,48.215093],[16.348281,48.212179],[16.348232,48.211822]]],"type":"Polygon"}},{"type":"Feature","properties":{"group_index":1,"value":600.0,"center":[16.368760371894094,48.2098020353984]},"geometry":{"coordinates":[[[16.359869,48.212199],[16.360292,48.206293],[16.361048,48.204648],[16.361093,48.204614],[16.361093,48.204614],[16.361138,48.204581],[16.362433,48.204412],[16.36327,48.204392],[16.368484,48.203054],[16.372307,48.204036],[16.376023,48.205011],[16.377483,48.20597],[16.378388,48.206874],[16.378533,48.207204],[16.378348,48.210416],[16.377806,48.21199],[16.376289,48.215033],[16.376018,48.215271],[16.372417,48.215606],[16.368345,48.215938],[16.36449,48.215487],[16.361609,48.215168],[16.361191,48.215076],[16.360943,48.214815],[16.359915,48.212556],[16.359869,48.212199]]],"type":"Polygon"}}],"metadata":{"attribution":"openrouteservice.org | OpenStreetMap contributors","service":"isochrones","timestamp":1576688678698,"query":{"locations":[[16.3584387512207,48.21077313487487],[16.36891009521484,48.20985797615404]],"location_type":"start","range":[600.0],"range_type":"time","intersections":false},"engine":{"version":"5.0.2","build_date":"2019-11-14T09:52:07Z"}}'>
      <input type="submit" value="Abschicken">
    </form>


    <?php

    // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
    include 'geoweb_pg_open.php';
    echo 'Die Datenbank '.pg_dbname($db).' wurde erfolgreich geöffnet.';

    // variable aus js 
    // $php_iso = json_decode($_POST['res']);
   

    echo"<br />";

    $php_iso = $_POST['res'];

    echo $php_iso;
    echo "<br />";
    echo "<br />";

      
    echo var_dump($php_iso);

    // function console_log($php_iso, $with_script_tags = true) {
    //   $js_code = 'console.log(' . json_encode($php_iso, JSON_HEX_TAG) . 
    //   ');';
    //     if ($with_script_tags) {
    //         $js_code = '<script>' . $js_code . '</script>';
    //     }
    //     echo $js_code;
    // }

    // zuerst json in db geben, muss man die variable statt dem jetztjson
    // $insert = "INSERT INTO g02.testisochrone(
    // WITH data AS (SELECT '$php_iso'
    //   ::json AS fc)

    // SELECT
    //   row_number() OVER () AS gid,
    //   public.ST_AsText(public.ST_GeomFromGeoJSON(feat->>'geometry')) AS geom,
    //   feat->'properties' AS properties
    // FROM (
    //   SELECT json_array_elements(fc->'features') AS feat
    //   FROM data
    // ) AS f)"

    // $result = pg_query($db,$insert) or die ('Fehler bei Speichern: '.pg_last_error($db));

    // // Datenbank schliessen
    // include 'geoweb_pg_close.php';

    ?>

  </body>
</html>