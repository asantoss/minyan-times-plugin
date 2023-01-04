<?php



/*
  Plugin Name: Minyan Times
  Description: A component that organizes prayer times by location or time block...
  Version: 1.0
  Author: Alexander Santos
*/

if (!defined('ABSPATH')) {
  exit;
}



class Minyantimes
{
  function __construct()
  {
    global $wpdb;
    $this->charset = $wpdb->get_charset_collate();
    $this->timesTableName = $wpdb->prefix . "times";
    $this->locationsTableName = $wpdb->prefix . "locations";
    add_action('init', array($this, 'loadScripts'));
    add_action('admin_menu', array($this, 'ourMenu'));
    register_activation_hook(__FILE__, array($this, 'onActivate'));


    add_action("rest_api_init", array($this, "initRest"));
  }
  function onActivate()
  {
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    $locationSql = "CREATE TABLE $this->locationsTableName (
      id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL DEFAULT '',
      address varchar(255) NOT NULL DEFAULT '',
      city varchar(255) NOT NULL DEFAULT '',
      PRIMARY KEY  (id)
    ) $this->charset;";
    $timesSql = "CREATE TABLE $this->timesTableName (
      id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      time varchar(50),
      nusach varchar(255) NOT NULL DEFAULT '',
      locationId bigint(20) NOT NULL,
      PRIMARY KEY  (id)
    ) $this->charset;";
    dbDelta($locationSql);
    dbDelta($timesSql);
  }





  function loadScripts()
  {
    register_block_type(__DIR__, array(
      'render_callback' => array($this, 'renderCallback')
    ));
  }


  function renderCallback($attributes)
  {
    ob_start(); ?>
<div id="minyan-times" class="minyan-times-wrapper">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</div>
<?php return ob_get_clean();
  }

  function ourMenu()
  {
    $mainPageHook = add_menu_page('Minyan Time Viewer', 'Time Viewer', 'manage_options', 'minyantimes', array($this, 'locationsPageHTML'), 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMCAyMEMxNS41MjI5IDIwIDIwIDE1LjUyMjkgMjAgMTBDMjAgNC40NzcxNCAxNS41MjI5IDAgMTAgMEM0LjQ3NzE0IDAgMCA0LjQ3NzE0IDAgMTBDMCAxNS41MjI5IDQuNDc3MTQgMjAgMTAgMjBaTTExLjk5IDcuNDQ2NjZMMTAuMDc4MSAxLjU2MjVMOC4xNjYyNiA3LjQ0NjY2SDEuOTc5MjhMNi45ODQ2NSAxMS4wODMzTDUuMDcyNzUgMTYuOTY3NEwxMC4wNzgxIDEzLjMzMDhMMTUuMDgzNSAxNi45Njc0TDEzLjE3MTYgMTEuMDgzM0wxOC4xNzcgNy40NDY2NkgxMS45OVoiIGZpbGw9IiNGRkRGOEQiLz4KPC9zdmc+', 100);
    add_action("load-{$mainPageHook}", array($this, 'settingsScripts'));
    add_action('admin_enqueue_scripts', array($this, 'settingsScripts'));
  }



  function settingsScripts()
  {
    wp_enqueue_style('minyan-setting-styles', plugin_dir_url(__FILE__) . 'build/styles.css');
    wp_enqueue_script('minyan-setting-scripts', plugin_dir_url(__FILE__) . 'build/Settings.js', array('wp-element', 'wp-i18n', 'wp-components'));
  }


  function locationsPageHTML()
  {
  ?>
<div id="minyan-location-settings" class="minyan-times-wrapper">
</div>
<?php
  }

  function initRest()
  {
    register_rest_route(
      "minyan-times/v1",
      "times",
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'get_times')
        ),
        array(
          'methods' => WP_REST_Server::CREATABLE,
          'callback' => array($this, 'create_times')
        )

      )
    );
    register_rest_route(
      "minyan-times/v1",
      "locations",
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'get_locations')
        ),
        array(
          'methods' => WP_REST_Server::CREATABLE,
          'callback' => array($this, 'create_locations')
        )
      )
    );
  }

  function get_times()
  {
    global $wpdb;

    $sql = "SELECT " . $this->timesTableName . ".id as id, name as location, time, city, address, locationId, nusach FROM " . $this->timesTableName . " INNER JOIN " . $this->locationsTableName . " l ON locationId = l.id";

    $results =  $wpdb->get_results($sql);
    return  $results;
  }

  function get_locations()
  {
    global $wpdb;

    $sql = "SELECT id, name, city, address FROM " . $this->locationsTableName;

    $results =  $wpdb->get_results($sql);
    return $results;
  }

  function create_locations($request)
  {
    global $wpdb;
    $parameters = $request->get_json_params();

    return $parameters;
  }

  function create_times($request)
  {
    global $wpdb;
    $parameters = $request->get_body_params();

    $time = $parameters["time"];
    $locationId = $parameters["locationId"];
    $nusach = $parameters["nusach"];
    if ($time && $locationId && $nusach) {
      $insert = $wpdb->insert(
        $this->timesTableName,
        array(
          "time" => $time,
          "locationId" => $locationId,
          "nusach" => $nusach
        )
      );
      if ($insert) {
        return rest_ensure_response('Sucess');
      }
      return new WP_Error('invalid', 'Invalid body', array('status' => 404));
    }

    return $parameters;
  }
}


$minyantimes = new MinyanTimes();