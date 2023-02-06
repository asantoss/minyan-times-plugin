<?php



class TimesController
{
    static $timesTableName;
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


    function get_times($request)
    {
        global $wpdb;
        $city = $request->get_param("city");
        $nusach = $request->get_param("nusach");
        $day = $request->get_param("day");
        $sortBy = $request->get_param("sortBy");
        $sql = "SELECT " . $this->timesTableName .
            ".id as id, post_id , post_title as location, time, isCustom, formula, minutes, type, nusach, day FROM "
            . $this->timesTableName .
            " INNER JOIN wp_posts l ON post_id = l.ID WHERE 1=1 ";
        // if ($city) {
        //     $sql = $wpdb->prepare($sql . " AND city = %s", $city);
        // }
        // if ($nusach) {
        //     $sql = $wpdb->prepare($sql . " AND nusach = %s", $nusach);
        // }
        // if ($day) {
        //     $search_text = "%" . $day . "%";
        //     $sql = $wpdb->prepare($sql . " AND day like %s", $search_text);
        // }
        if ($sortBy) {
            $sql = $wpdb->prepare($sql . "ORDER BY %s ASC", $sortBy);
        }




        $results = $wpdb->get_results($sql);
        return $results;
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
                "isCustom" => (int)$isCustom
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