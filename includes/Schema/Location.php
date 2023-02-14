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
        $metafields = ['address', "city", "state", "zipCode", "placeId", "geometry", "rabbi", "email", "website", "phone"];

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
}
