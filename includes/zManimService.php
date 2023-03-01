<?php

// $this->user = "0001583267";
$key = "94c8af54b8c190573f2dc0fed60bd2d1fd5e80ddd559b6a87f60fd2b1350864f179464977a084579";

//Look up the locationID for the desired place: (Uncomment one of the following examples)
// $locationID = findPostal("11559");    //Typical US zip code
//locationID = findPostal("M6B2K9");    //Typical Canadian postal code
//$locationID = findPostal("NW118AU");  //Typical UK postcode
//$locationID = findPostal("9050000");    //Typical 5-digit Israel Mikud code
//$locationID = findPostal("JFK");      //Typical airport code
//$locationID = findPostal("27526341"); //Typical MyZmanim LocationID
//$locationID = findGps(48.86413211779521324,2.32941612345133754);   //Typical GPS coordinates
class zManimService
{
    private $endpoint = 'https://api.myzmanim.com/engine1.json.aspx/';
    public $user = "";
    public $key = "";
    public function __construct($user, $key)
    {
        $this->user = $user;
        $this->key = $key;
        register_rest_route(
            "minyan-times/v1",
            "zManim/gps",
            array(
                array(
                    'methods' => WP_REST_Server::READABLE,
                    'callback' => array($this, 'get_zmanim_data_gps'),
                    'permission_callback' => function () {
                        return true;
                    }
                )
            )
        );
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
    }
    function get_zmanim_data($request)
    {
        $date = $request["date"];
        $postalCode = $request["postalCode"];
        if ($date && $postalCode) {
            $pLocationID = $this->findPostal($postalCode);
            $response = $this->getDay($date, $pLocationID);
            return $response;
        }
        return new WP_Error("invalid", "bad input", array("status" => 400));
    }
    function get_zmanim_data_gps($request)
    {
        $date = $request["date"];
        $lat = $request["lat"];
        $lng = $request["lng"];
        if ($date && $lat && $lng) {
            $postalCode = $this->findGps($lat, $lng);
            $response = $this->getDay($date, $postalCode);
            return $response;
        }
        return new WP_Error("invalid", "bad input", array("status" => 400));
    }
    function findGps($lat, $lon)
    {

        $params = "user=" . $this->user . "&key=" . $this->key . "&coding=PHP" . "&latitude=" . $lat . "&longitude=" . $lon;
        $response = $this->CallApi("searchGps", $params);
        if ($response->ErrMsg != NULL) {
            echo "Error: ";
            echo $response->ErrMsg;
            return;
        }
        return $response->LocationID;
    }

    function findPostal($pPostalCode)
    {

        $clientTimeZone = -5.0;      //Pass the client's time zone. Optional, but if provided, is sometimes used to resolve ambiguous queries.
        $params = "user=" . $this->user . "&key=" . $this->key . "&coding=PHP" . "&timezone=" . $clientTimeZone . "&query=" . $pPostalCode;
        $response = $this->CallApi("searchPostal", $params);
        if ($response->ErrMsg != NULL) {
            echo "Error: ";
            echo $response->ErrMsg;
            return;
        }
        return $response->LocationID;
    }
    function getToday($postalCode)
    {
        $pLocationID = $this->findPostal($postalCode);
        $params = "user=" . $this->user . "&key=" . $this->key . "&coding=PHP" . "&language=en" . "&locationID=" . $pLocationID . "&inputDate=" . date("Y-m-d");
        date_default_timezone_set('UTC');
        $response = $this->CallApi("getDay", $params);
        return $response;
    }
    function getDay($day, $pLocationID)
    {

        $params = "user=" . $this->user . "&key=" . $this->key . "&coding=PHP" . "&language=en" . "&locationID=" . $pLocationID . "&inputDate=" . $day;
        date_default_timezone_set('UTC');
        $response = $this->CallApi("getDay", $params);
        return $response;
    }
    function CallApi($method, $data)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $this->endpoint . $method);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);  // Delete this line for production:
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);  // Delete this line for production:
        $result = curl_exec($curl);                     // Make the call
        if (curl_errno($curl)) {
            echo 'Curl error: ' . curl_error($curl);
        }   // Check for errors.
        curl_close($curl);
        $obj = json_decode($result);
        return $obj;
    }
}
//Display zmanim information for said location.