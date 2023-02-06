<?php

/*
  Plugin Name: Minyan Times
  Description: A component that organizes prayer times by location or time block...
  Version: 0.0.14
  Author: Alexander Santos

  * Elementor tested up to: 3.5.0
  * Elementor Pro tested up to: 3.5.0
*/

if (!defined('ABSPATH')) {
  exit;
}



/**
 * Register scripts and styles for Elementor test widgets.
 */


require_once(__DIR__ . "/includes/zManimService.php");

require_once(__DIR__ . "/includes/TimesController.php");



class Minyantimes
{
  function __construct()
  {
    add_action('init', array($this, 'loadScripts'));
    add_action('admin_menu', array($this, 'ourMenu'));
    add_action("admin_init", array($this, 'settings'));
  }




  function loadScripts()
  {
    register_block_type(__DIR__, array(
      'render_callback' => array($this, 'renderCallback')
    ));
    wp_localize_script('llc-minyan-times-view-script', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
    ));

    add_action('elementor/widgets/register', [$this, 'register_new_widgets']);
  }

  function register_new_widgets($widgets_manager)
  {

    require_once(__DIR__ . "/includes/widgets/MinyanTimesBlock.php");
    wp_register_style('frontend-style', plugin_dir_url(__FILE__) . 'build/styles.css');
    wp_register_script('frontend-script', plugin_dir_url(__FILE__) . '/build/frontend.js', ['elementor-frontend', 'wp-element'], '1.0.0', true);
    wp_localize_script('frontend-script', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
    ));
    $widgets_manager->register(new \MTP\MinyanTimesBlock());
  }


  function renderCallback($attributes)
  {


    $attributes["googleKey"] = get_option("mtp_google_api_key");

    ob_start(); ?>
<div id="mtp-plugin">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</div>
<?php return ob_get_clean();
  }

  function ourMenu()
  {
    $mainPageHook = add_menu_page('Minyan Time Viewer', 'Time Viewer', 'manage_options', 'minyantimes', array($this, 'locationsPageHTML'), 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMCAyMEMxNS41MjI5IDIwIDIwIDE1LjUyMjkgMjAgMTBDMjAgNC40NzcxNCAxNS41MjI5IDAgMTAgMEM0LjQ3NzE0IDAgMCA0LjQ3NzE0IDAgMTBDMCAxNS41MjI5IDQuNDc3MTQgMjAgMTAgMjBaTTExLjk5IDcuNDQ2NjZMMTAuMDc4MSAxLjU2MjVMOC4xNjYyNiA3LjQ0NjY2SDEuOTc5MjhMNi45ODQ2NSAxMS4wODMzTDUuMDcyNzUgMTYuOTY3NEwxMC4wNzgxIDEzLjMzMDhMMTUuMDgzNSAxNi45Njc0TDEzLjE3MTYgMTEuMDgzM0wxOC4xNzcgNy40NDY2NkgxMS45OVoiIGZpbGw9IiNGRkRGOEQiLz4KPC9zdmc+', 100);
    add_action("load-{$mainPageHook}", array($this, 'settingsScripts'));
    add_action('admin_enqueue_scripts', array($this, 'settingsScripts'));
    add_options_page("Minyan Times Settings", "Minyan Times", "manage_options", "minyan-times-settings", array($this, "settings_page"));
  }

  function settings()
  {
    add_settings_section('mtp_first_section', 'zManim Api Credentials', null, 'minyan-times-settings');
    add_settings_field('mtp_api_key', 'Api Key', array($this, 'apiKeyHTML'), 'minyan-times-settings', 'mtp_first_section');
    add_settings_field('mtp_api_user', 'Api User', array($this, 'apiUserHtml'), 'minyan-times-settings', 'mtp_first_section');
    add_settings_field('mtp_google_api_key', 'Google Api Key', array($this, 'googleApiKey'), 'minyan-times-settings', 'mtp_first_section');
    register_setting("minyantimesplugin", 'mtp_api_user', array('sanitize_callback' => 'sanitize_text_field', "default" => ""));
    register_setting("minyantimesplugin", 'mtp_api_key', array('sanitize_callback' => 'sanitize_text_field', 'default' => ""));
    register_setting("minyantimesplugin", 'mtp_google_api_key', array('sanitize_callback' => 'sanitize_text_field', 'default' => ""));
  }

  function apiKeyHTML()
  {
  ?>

<input type="text" value="<?php echo get_option("mtp_api_key") ?>" name="mtp_api_key" id="mtp_api_key" />
<?php
  }
  function apiUserHtml()
  {
  ?>

<input value="<?php echo get_option("mtp_api_user") ?>" type="text" name="mtp_api_user" id="mtp_api_user" />
<?php
  }
  function googleApiKey()
  {
  ?>

<input value="<?php echo get_option("mtp_google_api_key") ?>" type="text" name="mtp_google_api_key"
    id="mtp_google_api_key" />
<?php
  }


  function settings_page()
  {
  ?>
<div class="wrap">
    <h1 class="settings_header">Minyan API Credentials</h1>
    <form action="options.php" method="POST">
        <?php
        settings_fields("minyantimesplugin");
        do_settings_sections("minyan-times-settings");
        submit_button();

        ?>
    </form>
</div>

<?php
  }



  function settingsScripts()
  {
    wp_next_scheduled('mtp_cron_hook');

    wp_enqueue_style('minyan-setting-styles', plugin_dir_url(__FILE__) . 'build/styles.css');
    wp_enqueue_script('minyan-setting-scripts', plugin_dir_url(__FILE__) . 'build/Settings.js', array('wp-element', 'wp-i18n', 'wp-components'));
    wp_localize_script('minyan-setting-scripts', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
      'nonce' => wp_create_nonce('wp_rest')
    ));
  }

  function locationsPageHTML()
  {

    $attributes = array();
    $attributes["googleKey"] = get_option("mtp_google_api_key");
  ?><div id="mtp-plugin" class="mtp-plugin-wrapper">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</div>
<?php
  }
}


class MinyanTimesApi
{
  private $zManimService;
  private $locationsTableName;
  private $timesTableName;
  private $charset;
  function __construct()
  {

    global $wpdb;
    $this->charset = $wpdb->get_charset_collate();
    $this->timesTableName = $wpdb->prefix . "times";
    $this->locationsTableName = $wpdb->prefix . "locations";
    $this->zManimService = new zManimService(get_option("mtp_api_user"), get_option("mtp_api_key"));
    register_activation_hook(__FILE__, array($this, 'onActivate'));
    add_action("rest_api_init", array($this, "initRest"));
    add_action('init', [$this, 'create_location_posts']);
    add_action('add_meta_boxes', [$this, 'create_location_meta_boxes']);
    add_action('enqueue_block_editor_assets', function () {
      wp_enqueue_script(
        'sidebar-data',
        plugin_dir_url(__FILE__) . 'build/Sidebar.js',
        ['wp-element', 'wp-blocks', 'wp-components', 'wp-editor'],
        '0.1.0',
        true
      );
      wp_enqueue_style('minyan-setting-styles', plugin_dir_url(__FILE__) . 'build/styles.css');
    });
  }

  function create_location_posts()
  {
    register_post_type(
      'mtp_location',
      [
        'labels' => [
          'name' => __('Locations', 'textdomain'),
          'singular_name' => __('Location', 'textdomain')
        ],
        'public' => true,
        'has_archive' => true,
        'publicly_queryable' => true,
        "show_ui" => true,
        "show_in_menu" => true,
        "show_in_rest" => true,
        "supports" => ['title', 'editor', 'thumbnail', 'revisions', 'custom-fields', 'revisions'],
        "can_export" => true,
      ]
    );
    $metafields = ['address', "city", "state", "zipCode", "placeId", "geometry", "rabbi"];

    foreach ($metafields as $metafield) {
      // Pass an empty string to register the meta key only on the mtp_location posts.
      register_post_meta('mtp_location', $metafield, array(
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'prepare_callback' => function ($value) {
          return is_object($value) ? $value : json_decode($value);
        },
      ));
    }
  }
  function create_location_meta_boxes()
  {
    add_meta_box(
      "location_metadata", // div id containing rendered fields
      "Location Info", //section Heading
      [$this, "render_location_meta"], //callback func to render fields
      "mtp_location", //post type name
      "normal", //Screen location
      'high' // placement
    );
  }


  function render_location_meta($post)
  {
    $attributes["googleKey"] = get_option("mtp_google_api_key");
    $attributes["id"] = $post->ID;
  ?>
<div id="mtp-plugin-sidebar">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</div>
<?php
  }



  function onActivate()
  {
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    $locationSql = "CREATE TABLE $this->locationsTableName (
id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
name varchar(255) NOT NULL DEFAULT '',
address varchar(255) NOT NULL DEFAULT '',
city varchar(255) NOT NULL DEFAULT '',
zipCode varchar(255) NOT NULL DEFAULT '',
state varchar(255) NOT NULL DEFAULT '',
lat varchar(255) NOT NULL DEFAULT '',
lng varchar(255) NOT NULL DEFAULT '',
place_id text NOT NULL DEFAULT '',
PRIMARY KEY (id)
) $this->charset;";




    $timesSql = "CREATE TABLE $this->timesTableName (
id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
time varchar(50),
formula bigint(20),
minutes bigint(20),
isCustom boolean,
day TEXT,
nusach varchar(255) NOT NULL DEFAULT '',
type varchar(255),
locationId bigint(20) unsigned,
post_id bigint(20) unsigned,
effectiveOn date,
expiresOn date,
isActive boolean,
PRIMARY KEY (id),
FOREIGN KEY (locationId) REFERENCES $this->locationsTableName(id),
FOREIGN KEY (post_id) REFERENCES wp_posts(ID),
) $this->charset;";
    dbDelta($locationSql);
    dbDelta($timesSql);
  }


  function perm_callback()
  {
    return current_user_can('manage_options');
  }

  function initRest()
  {
    wp_create_nonce('wp_rest');
    new TimesController();

    register_rest_route(
      "minyan-times/v1",
      "zManim",
      array(
        array(
          'methods' => WP_REST_Server::READABLE,
          'callback' => array($this, 'get_zmanim_data'),
          'permission_callback' => function () {
            return true;
          }
        )
      )
    );


    // Location Routes
    register_rest_route(
      "minyan-times/v1",
      "locations/(?P<id>\d+)",
      array(array(
        'methods' => WP_REST_Server::DELETABLE,
        'callback' => array($this, 'delete_location'),
        'permission_callback' => array($this, "perm_callback"),
        'args' => array(
          'id' => array(
            'validate_callback' => function ($param, $request, $key) {
              return is_numeric($param);
            }
          )
        )
      ), array(
        'methods' => WP_REST_Server::EDITABLE,
        'callback' => array($this, 'update_location'),
        'permission_callback' => array($this, "perm_callback"),
        'args' => array(
          'id' => array(
            'validate_callback' => function ($param, $request, $key) {
              return is_numeric($param);
            }
          )
        )
      ))
    );
    // register_rest_route(
    //   "minyan-times/v1",
    //   "locations",
    //   array(
    //     array(
    //       'methods' => WP_REST_Server::READABLE,
    //       'callback' => array($this, 'get_locations'),
    //       'permission_callback' => function () {
    //         return true;
    //       }
    //     ),
    //     array(
    //       'methods' => WP_REST_Server::CREATABLE,
    //       'callback' => array($this, 'create_locations'),
    //       'permission_callback' => array($this, "perm_callback")
    //     ),
    //   )
    // );
    register_rest_route(
      "minyan-times/v1",
      "locations",
      array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => array($this, 'get_location_posts'),
        'permission_callback' => function () {
          return true;
        }
      )

    );
  }


  function get_locations()
  {
    global $wpdb;
    $table = $this->locationsTableName;
    $sql = "SELECT id, name, city, address, zipCode, state, lat,lng FROM " . $table;
    $query = $wpdb->prepare($sql);
    $results = $wpdb->get_results($query);
    return $results;
  }
  function get_location_posts()
  {
    $args = [
      "post_type" => 'mtp_location',
      'post_status' => 'publish',
      'nopaging' => true
    ];
    $query = new WP_Query($args);
    $posts = $query->get_posts();
    return wp_send_json($posts);
  }

  function create_locations($request)
  {
    global $wpdb;
    $parameters = $request->get_body_params();
    $name = $parameters['name'];
    $zipCode = $parameters['zipCode'];
    $address = $parameters['address'];
    $state = $parameters['state'];
    $city = $parameters['city'];
    $lat = $parameters['lat'];
    $lng = $parameters['lng'];
    $place_id = $parameters['place_id'];
    $locationData = array(
      "name" => $name,
      "address" => $address,
      "city" => $city,
      "zipCode" => $zipCode,
      "state" => $state,
      "lat" => $lat,
      "lng" => $lng,
      "place_id" => $place_id,
    );

    if ($name && $address && $city) {
      $insert = $wpdb->insert(
        $this->locationsTableName,
        $locationData
      );
      if ($insert) {
        return rest_ensure_response('Success');
      }
      return new WP_Error('invalid', 'Invalid body', array('status' => 404));
    }

    return $parameters;
  }
  function update_location($request)
  {
    global $wpdb;
    $parameters = $request->get_body_params();
    $name = $parameters['name'];
    $address = $parameters['address'];
    $city = $parameters['city'];
    $state = $parameters['state'];
    $zipCode = $parameters['zipCode'];
    $id = $parameters['id'];
    $lat = $parameters['lat'];
    $lng = $parameters['lng'];
    $place_id = $parameters['place_id'];
    $locationData = array(
      "name" => $name,
      "address" => $address,
      "city" => $city,
      "zipCode" => $zipCode,
      "state" => $state,
      "lat" => $lat,
      "lng" => $lng,
      "place_id" => $place_id,
    );

    $update = $wpdb->update(
      $this->locationsTableName,
      $locationData,
      array("id" => $id),

    );
    switch ($update) {
      case 1:
        return rest_ensure_response("Success updated " . $update . " record(s)");
      case 0:
        return rest_ensure_response("No record updated");
      default:
        return new WP_Error("invalid", "bad input", array("status" => 400, 'update' => $update));
    }
  }
  function delete_location($request)
  {
    global $wpdb;
    $id = $request->get_param('id');
    $delete = $wpdb->delete(
      $this->locationsTableName,
      array(
        "id" => $id
      )
    );
    if ($delete) {
      $wpdb->delete(
        $this->timesTableName,
        array(
          "locationId" => $id
        )
      );
      return rest_ensure_response("Success");
    }
    return new WP_Error("invalid", "bad input", array("status" => 400));
  }

  function use_zManim_api($locations)
  {
    global $wpdb;

    $zManimLocations = array();
    foreach ($locations as $location) {
      $zipCode = $location->zipCode;
      $response = $this->zManimService->getToday($zipCode);
      $zManimLocations[$zipCode] =
        json_encode($response);
    }
    foreach ($zManimLocations as $key => $value) {
      $wpdb->update($this->locationsTableName, array("thirdPartyData" => $value), array("zipCode" => $key));
    }

    return wp_next_scheduled('mtp_cron_hook');
  }

  function get_zmanim_data($request)
  {
    $date = $request["date"];
    $postalCode = $request["postalCode"];
    if ($date && $postalCode) {
      $response = $this->zManimService->getDay($date, $postalCode);
      return $response;
    }
    return new WP_Error("invalid", "bad input", array("status" => 400));
  }


  function create_time($request)
  {
    global $wpdb;
    $parameters = $request->get_body_params();
    $time = $parameters["time"];
    $locationId = $parameters["locationId"];
    $nusach = $parameters["nusach"];
    $day = $parameters["day"];
    $type = $parameters["type"];
    $formula = $parameters["formula"];
    $minutes = $parameters["minutes"];
    $isCustom = $parameters["isCustom"];
    if (($time || $isCustom == "1") && $locationId && $nusach && $day) {
      $insert = $wpdb->insert(
        $this->timesTableName,
        array(
          "time" => $time,
          "locationId" => (int)$locationId,
          "isCustom" => (int)$isCustom,
          "nusach" => $nusach,
          "day" => $day,
          "type" => $type,
          "formula" => (int)$formula,
          "minutes" => (int)$minutes,
        )
      );
      if ($insert) {
        return rest_ensure_response('Success');
      }
      return new WP_Error('invalid', 'Invalid body', array('status' => 404));
    }

    return $parameters;
  }
}



$minyanTimesApi = new MinyanTimesApi();
$minyantimes = new MinyanTimes();