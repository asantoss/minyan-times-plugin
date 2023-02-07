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
    }
    function add_query_meta($wp_query = "")
    {

        //return In case if wp_query is empty or postmeta already exist
        if ((empty($wp_query)) || (!empty($wp_query) && !empty($wp_query->posts) && isset($wp_query->posts[0]->postmeta))) {
            return $wp_query;
        }

        $sql = $postmeta = '';
        $post_ids = array();
        $post_ids = wp_list_pluck($wp_query->posts, 'ID');
        if (!empty($post_ids)) {
            global $wpdb;
            $post_ids = implode(',', $post_ids);
            $sql = "SELECT meta_key, meta_value, post_id FROM $wpdb->postmeta WHERE post_id IN ($post_ids)";
            $postmeta = $wpdb->get_results($sql, OBJECT);
            if (!empty($postmeta)) {
                foreach ($wp_query->posts as $pKey => $pVal) {
                    $wp_query->posts[$pKey]->postmeta = new StdClass();
                    foreach ($postmeta as $mKey => $mVal) {
                        if ($postmeta[$mKey]->post_id == $wp_query->posts[$pKey]->ID) {
                            $newmeta[$mKey] = new stdClass();
                            $newmeta[$mKey]->meta_key = $postmeta[$mKey]->meta_key;
                            $newmeta[$mKey]->meta_value = maybe_unserialize($postmeta[$mKey]->meta_value);
                            $wp_query->posts[$pKey]->postmeta = (object) array_merge((array) $wp_query->posts[$pKey]->postmeta, (array) $newmeta);
                            unset($newmeta);
                        }
                    }
                }
            }
            unset($post_ids);
            unset($sql);
            unset($postmeta);
        }
        return $wp_query;
    }
    function get_location_posts()
    {

        $wp_query = new WP_Query([
            'post_type' => 'mtp_location'
        ]);

        $posts = $wp_query->get_posts();
        $response = [];


        foreach ($posts as $post) {
            $location = [
                "id" => $post->ID,
                "name" => $post->post_title,
                "address" => get_post_meta($post->ID, 'address', true),
                "rabbi" => get_post_meta($post->ID, 'rabbi', true),
                "city" => get_post_meta($post->ID, 'city', true),
                "state" => get_post_meta($post->ID, 'state', true),
                "zipCode" => get_post_meta($post->ID, 'zipCode', true),
                "geometry" => get_post_meta($post->ID, 'geometry', true),
            ];
            array_push($response, $location);
            # code...
        }

        return wp_send_json($response);
    }


    function perm_callback()
    {
        return current_user_can('manage_options');
    }
}