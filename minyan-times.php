<?php




/*
Plugin Name: Minyan Times
Description: A component that organizes prayer times by location or time block...
Version: 0.1.34
Author: Alexander Santos

* Elementor tested up to: 3.5.0
* Elementor Pro tested up to: 3.5.0
*/
$JS_VERSION = '0.1.34';

if (!defined('ABSPATH')) {
  exit;
}


require_once(__DIR__ . "/includes/zManimService.php");
require_once(__DIR__ . "/includes/TimesController.php");
require_once(__DIR__ . "/includes/LocationsController.php");
require_once(__DIR__ . "/includes/Schema/Location.php");



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
    wp_register_script('new-relic-telemetry', plugin_dir_url(__FILE__) . 'build/newrelic.js', null);


    add_action('elementor/widgets/register', [$this, 'register_new_widgets']);
  }

  function register_new_widgets($widgets_manager)
  {
    global $JS_VERSION;
    require_once(__DIR__ . "/includes/widgets/MinyanTimesBlock.php");
    require_once(__DIR__ . "/includes/widgets/LocationTimeBlock.php");
    require_once(__DIR__ . "/includes/widgets/MinyanTimesPostBlock.php");
    require_once(__DIR__ . "/includes/widgets/LocationMetaBlock.php");
    $widgets_manager->register(new \MTP\LocationMetaBlock());

    wp_register_style('frontend-style', plugin_dir_url(__FILE__) . 'build/styles.css', null, $JS_VERSION);
    wp_register_script('frontend-script', plugin_dir_url(__FILE__) . 'build/frontend.js', ['elementor-frontend', 'wp-element', 'wp-blocks', 'wp-components', 'new-relic-telemetry'], $JS_VERSION, true);
    wp_localize_script('frontend-script', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
    ));
    $widgets_manager->register(new \MTP\MinyanTimesBlock());

    wp_register_script('post-block-script', plugin_dir_url(__FILE__) . 'build/PostBlock.js', ['elementor-frontend', 'wp-element', 'wp-blocks', 'wp-components', 'new-relic-telemetry'], $JS_VERSION, true);
    wp_localize_script('post-block-script', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
    ));

    $widgets_manager->register(new \MTP\LocationTimeBlock());
    wp_register_script('time-block-script', plugin_dir_url(__FILE__) . 'build/TimeBlock.js', ['elementor-frontend', 'wp-element', 'wp-blocks', 'wp-components', 'new-relic-telemetry'], $JS_VERSION, true);
    wp_localize_script('time-block-script', 'wpApiSettings', array(
      'root' => esc_url_raw(rest_url()),
    ));
    $widgets_manager->register(new \MTP\MinyanTimesPostBlock());
  }


  function renderCallback($attributes)
  {
    global $post;

    $attributes["googleKey"] = get_option("mtp_google_api_key");
    $attributes["postId"] = $post->ID;

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

    <input value="<?php echo get_option("mtp_google_api_key") ?>" type="text" name="mtp_google_api_key" id="mtp_google_api_key" />
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

    global $JS_VERSION;
    wp_next_scheduled('mtp_cron_hook');

    wp_enqueue_style('minyan-setting-styles', plugin_dir_url(__FILE__) . 'build/styles.css', null, $JS_VERSION);
    wp_enqueue_script('minyan-setting-scripts', plugin_dir_url(__FILE__) . 'build/Settings.js', array('wp-element', 'wp-i18n', 'wp-components'), $JS_VERSION);
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
  private $locationsTableName;
  private $timesTableName;
  private $charset;
  function __construct()
  {

    global $wpdb;
    $this->charset = $wpdb->get_charset_collate();
    $this->timesTableName = $wpdb->prefix . "times";
    $this->locationsTableName = $wpdb->prefix . "locations";
    register_activation_hook(__FILE__, array($this, 'onActivate'));
    add_action("rest_api_init", array($this, "initRest"));
    add_action('enqueue_block_editor_assets', [$this, 'render_location_js']);
    LocationPost::getInstance();
  }


  function render_location_js()
  {

    add_meta_box(
      "location_metadata", // div id containing rendered fields
      "Address Information", //section Heading
      [$this, "render_location_meta"], //callback func to render fields
      "mtp_location", //post type name
      "normal", //Screen location
      'high' // placement
    );
    wp_enqueue_script(
      'sidebar-data',
      plugins_url('/build/Sidebar.js', __FILE__),
      ['wp-element', 'wp-blocks', 'wp-components', 'wp-editor'],
      '0.1.0',
      true
    );
    wp_enqueue_style('minyan-setting-styles', plugin_dir_url(__FILE__) . 'build/styles.css');
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
    $timesSql = "CREATE TABLE $this->timesTableName (
      id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      time varchar(50),
      formula bigint(20),
      minutes bigint(20),
      isCustom boolean,
      day TEXT,
      teacher TEXT,
      notes TEXT,
      language TEXT,
      nusach varchar(255),
      type varchar(255),
      locationId bigint(20) unsigned NULL DEFAULT NULL,
      post_id bigint(20) unsigned NULL,
      effectiveOn date,
      expiresOn date,
      IsAsaraBiteves boolean,
      IsCholHamoed boolean,
      IsErevPesach boolean,
      IsErevShabbos boolean,
      IsErevTishaBav boolean,
      IsErevYomKipper boolean,
      IsErevYomTov boolean,
      IsFastDay boolean,
      IsShabbos boolean,
      IsShivaAsarBitammuz boolean,
      IsTaanisEsther boolean,
      IsTishaBav boolean,
      IsTuBeshvat boolean,
      IsTzomGedalia boolean,
      IsYomKipper boolean,
      IsYomTov boolean,
      IsRoshChodesh boolean,
      PRIMARY KEY (id),
      FOREIGN KEY (post_id) REFERENCES wp_posts(ID)
      ) $this->charset;";
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
    new LocationsController();
    new zManimService(get_option("mtp_api_user"), get_option("mtp_api_key"));
  }
}



$minyanTimesApi = new MinyanTimesApi();
$minyantimes = new MinyanTimes();
