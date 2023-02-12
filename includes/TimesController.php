<?php



class TimesController
{
    public $timesTableName = 'wp_times';
    function __construct()
    {
        register_rest_route(
            "minyan-times/v1",
            "times",
            array(
                array(
                    'methods' => WP_REST_Server::READABLE,
                    'callback' => array($this, 'get_times'),
                    'permission_callback' => function () {
                        return true;
                    }
                ),
                array(
                    'methods' => WP_REST_Server::CREATABLE,
                    'callback' => array($this, 'create_time'),
                    'permission_callback' => array($this, "perm_callback")
                )
            )
        );
        register_rest_route(
            "minyan-times/v1",
            "times/(?P<id>\d+)",
            array(
                array(
                    'methods' => WP_REST_Server::DELETABLE,
                    'callback' => array($this, 'delete_time'),
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
                    'callback' => array($this, 'update_time'),
                    'permission_callback' => array($this, "perm_callback"),
                    'args' => array(
                        'id' => array(
                            'validate_callback' => function ($param, $request, $key) {
                                return is_numeric($param);
                            }
                        )
                    )
                )
            )
        );
    }
    function perm_callback()
    {
        return current_user_can('manage_options');
    }

    function get_times($request)
    {
        global $wpdb;
        $city = $request->get_param("city");
        $rabbi = $request->get_param("rabbi");
        $shul = $request->get_param("shul");
        $nusach = $request->get_param("nusach");
        $day = $request->get_param("day");
        $sortBy = $request->get_param("sortBy");
        $post_id = $request->get_param("postId");

        //Only filter the active ones by checking their effective date and expire date.
        $isActive = $request->get_param('isActive');
        $tableName = $this->timesTableName;
        $sql = "SELECT t.id, t.post_id , post_title as location, effectiveOn, expiresOn, cpm.meta_value as city, time,  isCustom, formula, minutes, type, nusach, day FROM " . $tableName .
            " t INNER JOIN wp_posts l ON t.post_id = l.ID
                LEFT JOIN wp_postmeta cpm on t.post_id = cpm.post_id AND cpm.meta_key = 'city'
                LEFT JOIN wp_postmeta rpm on t.post_id = rpm.post_id AND rpm.meta_key = 'rabbi'
                WHERE 1=1
                ";
        if ($nusach) {
            $sql = $wpdb->prepare($sql . " AND nusach = %s", $nusach);
        }
        if ($day) {
            $search_text = "%" . $day . "%";
            $sql = $wpdb->prepare($sql . " AND day like %s", $search_text);
        }
        if ($rabbi) {
            $search_text = "%" . $rabbi . "%";
            $sql = $wpdb->prepare($sql . " AND rpm.meta_value like %s", $search_text);
        }
        if ($shul) {
            $search_text = "%" . $shul . "%";
            $sql = $wpdb->prepare($sql . " AND post_title like %s", $search_text);
        }
        if ($post_id) {
            $sql = $wpdb->prepare($sql . " AND t.post_id = %s", $post_id);
        }
        if ($city) {
            $search_text = "%" . $city . "%";

            $sql = $wpdb->prepare($sql . " AND cpm.meta_value LIKE %s", $search_text);
        }
        $date = $request->get_param("date");
        if (!empty($date)) {
            $sql = $wpdb->prepare($sql . " AND effectiveOn IS NOT NULL AND effectiveOn <= %s", $date);
            $sql = $wpdb->prepare($sql . " AND  expiresOn IS NOT NULL AND expiresOn > %s", $date);
        }


        if ($sortBy) {
            $sql = $wpdb->prepare($sql . "ORDER BY %s ASC", $sortBy);
        }




        $results = $wpdb->get_results($sql);



        foreach ($results as $item) {
            $item->address = get_post_meta($item->post_id, 'address', true);
            $item->rabbi = get_post_meta($item->post_id, 'rabbi', true);
            $item->city = get_post_meta($item->post_id, 'city', true);
            $item->state = get_post_meta($item->post_id, 'state', true);
            $item->zipCode = get_post_meta($item->post_id, 'zipCode', true);
            $item->geometry = get_post_meta($item->post_id, 'geometry', true);
            # code...
        }



        return $results;
    }

    function create_time($request)
    {
        global $wpdb;
        $parameters = $request->get_body_params();
        $time = $parameters["time"];
        $postId = $parameters["post_id"];
        $nusach = $parameters["nusach"];
        $day = $parameters["day"];
        $type = $parameters["type"];
        $formula = $parameters["formula"];
        $minutes = $parameters["minutes"];
        $effectiveOn = $parameters["effectiveOn"];
        if (empty($effectiveOn)) {
            $effectiveOn = null;
        }
        $expiresOn = $parameters["expiresOn"];
        if (empty($expiresOn)) {
            $expiresOn = null;
        }
        $isCustom = $parameters["isCustom"];
        if (($time || $isCustom == "1") && $postId && $nusach && $day) {
            $insert = $wpdb->insert(
                $this->timesTableName,
                array(
                    "time" => $time,
                    "post_id" => (int)$postId,
                    "isCustom" => (int)$isCustom,
                    "nusach" => $nusach,
                    "day" => $day,
                    "type" => $type,
                    "formula" => (int)$formula,
                    "minutes" => (int)$minutes,
                    "expiresOn" => $expiresOn,
                    "effectiveOn" => $effectiveOn,
                )
            );
            if ($insert) {
                return rest_ensure_response('Success');
            }
            return new WP_Error('invalid', 'Invalid body', array('status' => 404));
        }

        return $parameters;
    }

    function delete_time($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $delete = $wpdb->delete(
            $this->timesTableName,
            array(
                "id" => $id
            )
        );
        if ($delete) {
            return rest_ensure_response("Success");
        }
        return new WP_Error("invalid", "bad input", array("status" => 400));
    }



    function update_time($request)
    {
        global $wpdb;
        $parameters = $request->get_body_params();
        $time = $request["time"];
        $post_id = $parameters["post_id"];
        $nusach = $parameters["nusach"];
        $day = $parameters["day"];
        $id = $parameters["id"];
        $type = $parameters["type"];
        $formula = $parameters["formula"];
        $minutes = $parameters["minutes"];
        $isCustom = $parameters["isCustom"];
        $effectiveOn = $parameters["effectiveOn"];
        if (empty($effectiveOn)) {
            $effectiveOn = null;
        }
        $expiresOn = $parameters["expiresOn"];
        if (empty($expiresOn)) {
            $expiresOn = null;
        }
        $update = $wpdb->update(
            $this->timesTableName,
            array(
                "time" => $time,
                "post_id" => (int)$post_id,
                "nusach" => $nusach,
                "day" => $day,
                "type" => $type,
                "formula" => (int)$formula,
                "minutes" => (int)$minutes,
                "isCustom" => (int)$isCustom,
                "expiresOn" => $expiresOn,
                "effectiveOn" => $effectiveOn,
            ),
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
}
