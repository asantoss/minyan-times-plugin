<?php

namespace MTP;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if (!defined('ABSPATH'))
    exit;

class LocationTimeBlock extends Widget_Base
{
    public function get_name()
    {
        return 'time-block';
        # code...
    }

    public function __construct($data = [], $args = null)
    {
        parent::__construct($data, $args);
    }



    public function get_script_depends()
    {
        return ['time-block-script'];
    }

    public function get_style_depends()
    {
        return ['frontend-style'];
    }

    public function get_title()
    {
        return 'Location Time Block';
        # code...
    }
    public function get_icon()
    {
        return 'eicon-code';
    }
    public function get_categories()
    {
        return ['general'];
    }
    protected function _register_controls()
    {
        $this->start_controls_section('property-section', [
            'label' => esc_html__('Properties', 'textdomain'),
            'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control(
            'day',
            [
                'label' => esc_html__('Type', 'textdomain'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'Shacharis',
                'options' => [
                    'Sunday'  => esc_html__('Sunday', 'textdomain'),
                    'Monday' => esc_html__('Monday', 'textdomain'),
                    'Tuesday' => esc_html__('Tuesday', 'textdomain'),
                    'Wednesday' => esc_html__('Wednesday', 'textdomain'),
                    'Thursday' => esc_html__('Thursday', 'textdomain'),
                    'Friday' => esc_html__('Friday', 'textdomain'),
                    'Shabbos' => esc_html__('Shabbos', 'textdomain'),
                ],
            ]
        );
        $this->add_control(
            'list',
            [
                'label' => esc_html__('Format List', 'textdomain'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => esc_html__('List', 'textdomain'),
                'label_off' => esc_html__('Block', 'textdomain'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'type',
            [
                'label' => esc_html__('Type', 'textdomain'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'Shacharis',
                'options' => [
                    'Mincha'  => esc_html__('Mincha', 'textdomain'),
                    'Mincha/Maariv' => esc_html__('Mincha/Maariv', 'textdomain'),
                    'Maariv' => esc_html__('Maariv', 'textdomain'),
                    'Shacharis' => esc_html__('Shacharis', 'textdomain'),
                    'Daf Yomi' => esc_html__('Daf Yomi', 'textdomain'),
                ],
            ]
        );
        $this->end_controls_section('property-section');
    }

    //PHP RENDER
    protected function render()
    {
        global $post;
        $attributes = $this->get_settings_for_display();
        $attributes["googleKey"] = get_option("mtp_google_api_key");
        $attributes["postId"] = $post->ID;
        $zipCode = get_post_meta($post->ID, 'zipCode', true);
        if (empty($zipCode)) {
            $attributes["zipCode"] = '21209';
        } else {
            $attributes["zipCode"] = $zipCode;
        }
        $title = $post->post_title;
        $attributes["title"] = $title;
        $city = get_post_meta($post->ID, 'city', true);
        if (empty($city)) {
            $attributes["city"] = 'Baltimore';
        } else {
            $attributes["city"] = $city;
        }
?>
<span class="mtp-time-block">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</span>
<?php

        # code...
    }
    protected function _content_template()
    {
        # code...
    ?>
<span class='mtp-time-block'>
    <pre style="display: none;">{{{JSON.stringify(settings)}}}</pre>
</span>
<?php

    }
}