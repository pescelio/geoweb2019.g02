  <?php

    // PostgreSQL-Datenbank öffnen (die php-datei liefert Datenbank-Kennung $db)
    include 'geoweb_pg_open.php';
    echo 'Die Datenbank '.pg_dbname($db).' wurde erfolgreich geöffnet.';

    // variable aus js 
    // $php_iso = json_decode($_POST['res_str']);
   

   // echo"<br />";

  //  foreach ($_POST as $post) {
  //     echo "Inhalt POST: $post";
  //  }

    $php_iso = $_POST['res_ueb'];
    print_r ($php_iso);

   // echo "<br />";
   // echo "<br />";

      
   // echo var_dump($php_iso);

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

    // Datenbank schliessen
    include 'geoweb_pg_close.php';

    ?>