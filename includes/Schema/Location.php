<?php

class LocationPost
{
    // Hold the class instance.
    private static $instance = null;

    // The constructor is private
    // to prevent initiation with outer code.
    private function __construct()
    {
        // The expensive process (e.g.,db connection) goes here.
        add_action('init', [$this, 'create_entity']);
    }

    // The object is created from within the class itself
    // only if the class has no instance.
    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new LocationPost();
        }

        return self::$instance;
    }





    function create_entity()
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
        $metafields = ['address', "city", "state", "zipCode", "placeId", "geometry", "rabbi", "email", "website", "phone", "full_address"];

        foreach ($metafields as $metafield) {
            // Pass an empty string to register the meta key only on the shul posts.
            register_post_meta('mtp_location', $metafield, array(
                'show_in_rest' => true,
                'type' => 'string',
                'single' => true,
                'prepare_callback' => function ($value) {
                    return is_object($value) ? $value : json_decode($value);
                },
            ));
        }
        add_filter('manage_mtp_location_posts_columns', [$this, 'add_meta_columns']);
        add_action('manage_posts_custom_column', [$this, 'action_custom_columns_content'], 10, 2);
    }
    function add_meta_columns($columns)
    {
        // this will add the column to the end of the array
        $columns['rabbi'] = 'Rabbi';
        $columns['city'] = 'City';
        $columns['state'] = 'State';
        $columns['zipCode'] = 'Zip Code';
        $columns['times'] = 'Time Records';

        //add more columns as needed

        // as with all filters, we need to return the passed content/variable
        return $columns;
    }
    function action_custom_columns_content($column_id, $post_id)
    {
        global $wpdb;
        $timeCountSQL = "SELECT Id FROM wp_times WHERE post_id = $post_id";
        //run a switch statement for all of the custom columns created
        switch ($column_id) {
            case 'rabbi':
                echo ($value = get_post_meta($post_id, 'rabbi', true)) ? $value : 'N/A';
                break;
            case 'city':
                echo ($value = get_post_meta($post_id, 'city', true)) ? $value : 'N/A';
                break;
            case 'state':
                echo ($value = get_post_meta($post_id, 'state', true)) ? $value : 'N/A';
                break;
            case 'zipCode':
                echo ($value = get_post_meta($post_id, 'zipCode', true)) ? $value : 'N/A';
                break;
            case 'times':
                $timeCount = $wpdb->get_results($timeCountSQL);
                echo ($value = count($timeCount)) ? $value : 'N/A';
                break;
        }
    }
}
