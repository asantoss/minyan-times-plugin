<?php



class LocationsController
{
    public $timesTableName = 'wp_times';
    function __construct()
    {
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
        register_rest_route(
            "minyan-times/v1",
            "cities",
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_cities'),
                'permission_callback' => function () {
                    return true;
                }
            )
        );
        register_rest_route(
            "minyan-times/v1",
            "shuls",
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_shuls'),
                'permission_callback' => function () {
                    return true;
                }
            )
        );
        register_rest_route(
            "minyan-times/v1",
            "rabbis",
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_rabbis'),
                'permission_callback' => function () {
                    return true;
                }
            )
        );

        register_rest_route(
            "minyan-times/v1",
            "migrate",
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'migrate_to_post'),
                'permission_callback' => function () {
                    return true;
                }
            )
        );
    }
    function migrate_to_post()
    {
        global $wpdb;

        $locationSql = "SELECT Id, name, address, city, zipCode, state FROM wp_locations";


        $results = $wpdb->get_results($locationSql);


        foreach ($results as $location) {
            $post_id = wp_insert_post(array(
                'post_type' => 'mtp_location',
                'post_title' => $location->name,
                'post_status' => 'publish'
            ));
            if ($post_id) {
                // insert post meta
                add_post_meta($post_id, 'address', $location->address);
                add_post_meta($post_id, 'city', $location->city);
                add_post_meta($post_id, 'zipCode', $location->zipCode);
                $time_records = $wpdb->get_results($wpdb->prepare("SELECT Id FROM " . $this->timesTableName . " WHERE locationId = %s", $location->Id));
                if (count($time_records) > 0) {
                    foreach ($time_records as $record) {
                        $wpdb->update(
                            $this->timesTableName,
                            array(
                                "post_id" => (int)$post_id
                            ),
                            array("id" => $record->Id),

                        );
                    }
                }
            }
        }
    }

    public function get_cities()
    {
        global $wpdb;
        $sql = $wpdb->prepare('SELECT DISTINCT cpm.meta_value as city FROM wp_posts l
        INNER JOIN wp_postmeta  cpm on l.ID = cpm.post_id AND cpm.meta_key = %s
        WHERE  l.post_type= %s AND cpm.meta_key IS NOT NULL ', ['city', 'mtp_location']);
        $results = $wpdb->get_results($sql);
        $cities = array_map(function ($record) {
            return $record->city;
        }, $results);
        return $cities;
    }

    public function get_rabbis($request)
    {
        global $wpdb;
        $city = $request->get_param("city");

        $sql = $wpdb->prepare('SELECT DISTINCT  pm.meta_value as rabbi FROM wp_posts l
        INNER JOIN wp_postmeta  pm on l.ID = pm.post_id AND pm.meta_key = %s
        INNER JOIN wp_postmeta  cpm on l.ID = cpm.post_id AND cpm.meta_key = %s
        WHERE  l.post_type = %s AND NULLIF(pm.meta_value, \'\') IS NOT NULL ', ['rabbi', 'city', 'mtp_location']);
        if ($city) {
            $search_text = "%" . $city . "%";
            $sql = $wpdb->prepare($sql . " AND LOWER( cpm.meta_value ) LIKE  LOWER (%s)", $search_text);
        }
        $results = $wpdb->get_results($sql);

        $rabbis = array_map(function ($record) {
            return $record->rabbi;
        }, $results);

        return $rabbis;
    }

    public function get_shuls($request)
    {
        global $wpdb;
        $city = $request->get_param("city");

        $sql = $wpdb->prepare('SELECT DISTINCT post_title FROM wp_posts l
        INNER JOIN wp_postmeta  cpm on l.ID = cpm.post_id AND cpm.meta_key = %s
        WHERE  l.post_type= %s AND cpm.meta_key IS NOT NULL ', ['city', 'mtp_location']);
        if ($city) {
            $search_text = "%" . $city . "%";
            $sql = $wpdb->prepare($sql . " AND LOWER( cpm.meta_value ) LIKE  LOWER (%s)", $search_text);
        }
        $results = $wpdb->get_results($sql);

        $shuls = array_map(function ($record) {
            return $record->post_title;
        }, $results);

        return $shuls;
    }
    function get_location_posts()
    {
        global $wpdb;
        $sql = $wpdb->prepare('SELECT ID, post_title FROM wp_posts WHERE post_type = %s', 'mtp_location');


        $posts = $wpdb->get_results($sql);
        foreach ($posts as $post) {
            $post->address = get_post_meta($post->ID, 'address', true);
            $post->rabbi = get_post_meta($post->ID, 'rabbi', true);
            $post->city = get_post_meta($post->ID, 'city', true);
            $post->state = get_post_meta($post->ID, 'state', true);
            $post->zipCode = get_post_meta($post->ID, 'zipCode', true);
            $post->geometry = get_post_meta($post->ID, 'geometry', true);
            # code...
        }
        return wp_send_json($posts);
    }



    function perm_callback()
    {
        return current_user_can('manage_options');
    }
}
