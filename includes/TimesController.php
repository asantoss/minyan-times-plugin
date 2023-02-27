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
            "teachers",
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_teachers'),
                'permission_callback' => function () {
                    return true;
                }
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
    public function get_teachers($request)
    {
        global $wpdb;
        $city = $request->get_param("city");


        $tableName = $this->timesTableName;
        $sql = "SELECT  teacher FROM  $tableName t INNER JOIN wp_posts l ON t.post_id = l.ID INNER JOIN wp_postmeta cpm on t.post_id = cpm.post_id AND cpm.meta_key = 'city' WHERE 1=1 AND NULLIF(teacher, '') IS NOT NULL";
        if ($city) {
            $search_text = "%" . $city . "%";
            $sql = $wpdb->prepare($sql . " AND LOWER( cpm.meta_value ) LIKE  LOWER (%s)", $search_text);
        }
        $results = $wpdb->get_results($sql);
        $teachers = array_map(function ($record) {
            return $record->teacher;
        }, $results);
        return $teachers;
    }
    function get_times($request)
    {
        global $wpdb;
        $city = $request->get_param("city");
        $rabbi = $request->get_param("rabbi");
        $teacher = $request->get_param("teacher");
        $shul = $request->get_param("shul");
        $nusach = $request->get_param("nusach");
        $day = $request->get_param("day");
        $sortBy = $request->get_param("sortBy");
        $post_id = $request->get_param("postId");
        $type = $request->get_param("type");
        $holidays = $request->get_param("holidays");

        //Only filter the active ones by checking their effective date and expire date.
        $tableName = $this->timesTableName;
        $sql = "SELECT t.id, t.post_id, holidayFilter, teacher,notes, post_title as location,
        IsAsaraBiteves, IsCholHamoed ,IsErevPesach ,IsErevShabbos , IsErevTishaBav ,
        IsErevYomKipper ,IsErevYomTov ,IsFastDay ,IsShabbos ,IsShivaAsarBitammuz ,IsTaanisEsther ,
        IsTishaBav ,IsTuBeshvat ,IsTzomGedalia ,IsYomKipper ,IsYomTov, IsRoshChodesh,
        locationId, effectiveOn, expiresOn, cpm.meta_value as city, time,  isCustom, formula, minutes, type, nusach, day 
         FROM " . $tableName .
            " t LEFT JOIN wp_posts l ON t.post_id = l.ID
                LEFT JOIN wp_postmeta cpm on t.post_id = cpm.post_id AND cpm.meta_key = 'city'
                LEFT JOIN wp_postmeta rpm on t.post_id = rpm.post_id AND rpm.meta_key = 'rabbi'
                WHERE 1=1
                ";
        if ($nusach) {
            $sql = $wpdb->prepare($sql . " AND nusach = %s", $nusach);
        }
        if ($day) {
            $search_text = "%" . $day . "%";
            $sql = $wpdb->prepare($sql . " AND day LIKE %s", $search_text);
        }
        if ($rabbi) {
            $search_text = "%" . $rabbi . "%";
            $sql = $wpdb->prepare($sql . " AND rpm.meta_value LIKE %s", $search_text);
        }
        if ($teacher) {
            $search_text = "%" . $teacher . "%";
            $sql = $wpdb->prepare($sql . " AND teacher LIKE %s", $search_text);
        }
        if ($type) {
            $sql = $wpdb->prepare($sql . " AND type = %s", $type);
        }
        if ($shul) {
            $search_text = "%" . $shul . "%";
            $sql = $wpdb->prepare($sql . " AND post_title LIKE %s", $search_text);
        }
        if ($post_id) {
            $sql = $wpdb->prepare($sql . " AND t.post_id =  %s ", $post_id);
        }
        if ($city) {
            $search_text = "%" . $city . "%";

            $sql = $wpdb->prepare($sql . " AND LOWER( cpm.meta_value ) LIKE  LOWER (%s)", $search_text);
        }
        $date = $request->get_param("date");
        if (!empty($date)) {
            $sql = $wpdb->prepare($sql . " AND (effectiveOn <= %s OR effectiveOn IS NULL)", $date);
            $sql = $wpdb->prepare($sql . " AND  (expiresOn > %s OR expiresOn IS NULL)", $date);
        }






        if ($sortBy) {
            $sql = $wpdb->prepare($sql . "ORDER BY %s ASC", $sortBy);
        }





        $results = $wpdb->get_results($sql);

        $return_items = [];

        foreach ($results as $item) {
            $item->address = get_post_meta($item->post_id, 'address', true);
            $item->rabbi = get_post_meta($item->post_id, 'rabbi', true);
            $item->city = get_post_meta($item->post_id, 'city', true);
            $item->state = get_post_meta($item->post_id, 'state', true);
            $item->zipCode = get_post_meta($item->post_id, 'zipCode', true);
            $item->geometry = get_post_meta($item->post_id, 'geometry', true);
            $item->locationSlug = basename(get_permalink($item->post_id));
            $holidayFilter = $item->holidayFilter;
            $isHidden = $holidayFilter == "1";
            foreach ($holidays as $holiday => $val) {
                $itemVal = $item->$holiday;
                if ($holidayFilter === "1") {
                    if ($itemVal === "0" && $val === "true") {
                        $isHidden = false;
                    }
                } else {
                    if ($itemVal === "1" && $val === "true") {
                        $isHidden = true;
                    }
                }
            }
            if (!$isHidden) {

                array_push($return_items, $item);
            }
            # code...
        }



        return $return_items;
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
        $teacher = $parameters["teacher"];
        $notes = $parameters["notes"];
        $holidayFilter = $parameters["holidayFilter"];
        $effectiveOn = $parameters["effectiveOn"];
        if (empty($effectiveOn)) {
            $effectiveOn = null;
        }
        $expiresOn = $parameters["expiresOn"];
        if (empty($expiresOn)) {
            $expiresOn = null;
        }
        $isCustom = $parameters["isCustom"];

        $IsAsaraBiteves = $parameters['IsAsaraBiteves'];
        $IsCholHamoed = $parameters['IsCholHamoed'];
        $IsErevPesach = $parameters['IsErevPesach'];
        $IsErevShabbos = $parameters['IsErevShabbos'];
        $IsErevTishaBav = $parameters['IsErevTishaBav'];
        $IsErevYomKipper = $parameters['IsErevYomKipper'];
        $IsErevYomTov = $parameters['IsErevYomTov'];
        $IsFastDay = $parameters['IsFastDay'];
        $IsRoshChodesh = $parameters['IsRoshChodesh'];
        $IsShabbos = $parameters['IsShabbos'];
        $IsShivaAsarBitammuz = $parameters['IsShivaAsarBitammuz'];
        $IsTaanisEsther = $parameters['IsTaanisEsther'];
        $IsTishaBav = $parameters['IsTishaBav'];
        $IsTuBeshvat = $parameters['IsTuBeshvat'];
        $IsTzomGedalia = $parameters['IsTzomGedalia'];
        $IsYomKipper = $parameters['IsYomKipper'];
        $IsYomTov = $parameters['IsYomTov'];

        if (($time || $isCustom == "1") && $postId && $day) {
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
                    "notes" => $notes,
                    'IsAsaraBiteves' => (int)$IsAsaraBiteves,
                    'IsCholHamoed' => (int)$IsCholHamoed,
                    'IsErevPesach' => (int)$IsErevPesach,
                    'IsErevShabbos' => (int)$IsErevShabbos,
                    'IsErevTishaBav' => (int)$IsErevTishaBav,
                    'IsErevYomKipper' => (int)$IsErevYomKipper,
                    'IsErevYomTov' => (int)$IsErevYomTov,
                    'IsFastDay' => (int)$IsFastDay,
                    'IsRoshChodesh' => (int)$IsRoshChodesh,
                    'IsShabbos' => (int)$IsShabbos,
                    'IsShivaAsarBitammuz' => (int)$IsShivaAsarBitammuz,
                    'IsTaanisEsther' => (int)$IsTaanisEsther,
                    'IsTishaBav' => (int)$IsTishaBav,
                    'IsTuBeshvat' => (int)$IsTuBeshvat,
                    'IsTzomGedalia' => (int)$IsTzomGedalia,
                    'IsYomKipper' => (int)$IsYomKipper,
                    'IsYomTov' => (int)$IsYomTov,
                    'holidayFilter' => (int)$holidayFilter,
                    'teacher' => $teacher
                )
            );
            if ($insert) {
                return rest_ensure_response('Success');
            }
        }

        return new WP_Error('invalid', $wpdb->last_error, array('status' => 400));
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
        return new WP_Error("invalid", $wpdb->last_error, array("status" => 400));
    }



    function update_time($request)
    {
        global $wpdb;
        $parameters = $request->get_body_params();
        $time = $request["time"];
        $nusach = $parameters["nusach"];
        $day = $parameters["day"];
        $id = $parameters["id"];
        $type = $parameters["type"];
        $formula = $parameters["formula"];
        $minutes = $parameters["minutes"];
        $isCustom = $parameters["isCustom"];
        $notes = $parameters["notes"];
        $teacher = $parameters["teacher"];

        $effectiveOn = $parameters["effectiveOn"];
        if (empty($effectiveOn) || $effectiveOn == "0000-00-00") {
            $effectiveOn = null;
        }
        $expiresOn = $parameters["expiresOn"];
        if (empty($expiresOn) || $expiresOn == "0000-00-00") {
            $expiresOn = null;
        }
        $holidayFilter = $parameters['holidayFilter'];
        $IsAsaraBiteves = $parameters['IsAsaraBiteves'];
        $IsCholHamoed = $parameters['IsCholHamoed'];
        $IsErevPesach = $parameters['IsErevPesach'];
        $IsErevShabbos = $parameters['IsErevShabbos'];
        $IsErevTishaBav = $parameters['IsErevTishaBav'];
        $IsErevYomKipper = $parameters['IsErevYomKipper'];
        $IsErevYomTov = $parameters['IsErevYomTov'];
        $IsFastDay = $parameters['IsFastDay'];
        $IsRoshChodesh = $parameters['IsRoshChodesh'];
        $IsShabbos = $parameters['IsShabbos'];
        $IsShivaAsarBitammuz = $parameters['IsShivaAsarBitammuz'];
        $IsTaanisEsther = $parameters['IsTaanisEsther'];
        $IsTishaBav = $parameters['IsTishaBav'];
        $IsTuBeshvat = $parameters['IsTuBeshvat'];
        $IsTzomGedalia = $parameters['IsTzomGedalia'];
        $IsYomKipper = $parameters['IsYomKipper'];
        $IsYomTov = $parameters['IsYomTov'];



        $updatePayload = array(
            "time" => $time,
            "nusach" => $nusach,
            "day" => $day,
            "type" => $type,
            "formula" => (int)$formula,
            "minutes" => (int)$minutes,
            "isCustom" => (int)$isCustom,
            "expiresOn" => $expiresOn,
            "effectiveOn" => $effectiveOn,
            "notes" => $notes,
            'IsAsaraBiteves' => (int)$IsAsaraBiteves,
            'IsCholHamoed' => (int)$IsCholHamoed,
            'IsErevPesach' => (int)$IsErevPesach,
            'IsErevShabbos' => (int)$IsErevShabbos,
            'IsErevTishaBav' => (int)$IsErevTishaBav,
            'IsErevYomKipper' => (int)$IsErevYomKipper,
            'IsErevYomTov' => (int)$IsErevYomTov,
            'IsFastDay' => (int)$IsFastDay,
            'IsRoshChodesh' => (int)$IsRoshChodesh,
            'IsShabbos' => (int)$IsShabbos,
            'IsShivaAsarBitammuz' => (int)$IsShivaAsarBitammuz,
            'IsTaanisEsther' => (int)$IsTaanisEsther,
            'IsTishaBav' => (int)$IsTishaBav,
            'IsTuBeshvat' => (int)$IsTuBeshvat,
            'IsTzomGedalia' => (int)$IsTzomGedalia,
            'IsYomKipper' => (int)$IsYomKipper,
            'IsYomTov' => (int)$IsYomTov,
            'holidayFilter' => (int)$holidayFilter,
            'teacher' => $teacher
        );
        $update = $wpdb->update(
            $this->timesTableName,
            $updatePayload,
            array("id" => $id),

        );
        switch ($update) {
            case 1:
                return rest_ensure_response("Success updated " . $update . " record(s)");
            case 0:
                return rest_ensure_response("No record updated");
            default:
                return new WP_Error("invalid", $wpdb->last_error, array("status" => 400, 'update' => $update));
        }
    }
}
