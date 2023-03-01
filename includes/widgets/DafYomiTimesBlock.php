<?php

namespace MTP;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if (!defined('ABSPATH'))
    exit;

class DafTimesBlock extends Widget_Base
{
    public function get_name()
    {
        return 'daf-yomi-times-block';
        # code...
    }

    public function __construct($data = [], $args = null)
    {
        parent::__construct($data, $args);
    }



    public function get_script_depends()
    {
        return ['frontend-script'];
    }

    public function get_style_depends()
    {
        return ['frontend-style'];
    }

    public function get_title()
    {
        return 'Daf Times Block';
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


        $prayerTypes =   ['Daf Yomi'];
        $repeater = new \Elementor\REPEATER();
        $repeater->add_control(
            'url',
            [
                'label' => esc_html__('Url', 'textdomain'),
                'type' => \Elementor\Controls_Manager::URL,
                'default' => ['url' => 'https://www.amfcreative.com/', 'is_external' => true, 'nofollow' => true],
                'label_block' => true,
            ]
        );

        $repeater->add_control(
            'logo',
            [
                'label' => esc_html__('Logo', 'textdomain'),
                'type' => \Elementor\Controls_Manager::MEDIA

            ]
        );
        $this->start_controls_section(
            'Sponsors',
            [
                'label' =>  'Sponsors',
                'tab' =>
                \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        foreach ($prayerTypes as &$value) {

            $this->add_control(
                $value,
                [
                    'label' => ($value),
                    'type' => Controls_Manager::REPEATER,
                    'fields' => $repeater->get_controls(),
                    'default' => [
                        'url' => ['url' => 'https://www.amfcreative.com/']
                    ],
                    'title_field' => $value . ' Sponsors'
                ]
            );
        }
        $this->end_controls_section();
    }

    //PHP RENDER
    protected function render()
    {
        global $post;
        $attributes = $this->get_settings_for_display();
        $attributes["googleKey"] = get_option("mtp_google_api_key");
        $attributes["postId"] = $post->ID;
        $attributes["isDafYomi"] = true;
        $attributes['city'] = "Baltimore";

?>
<div id="mtp-plugin-daf-yomi">
    <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
</div>
<?php

        # code...
    }
    protected function _content_template()
    {
        # code...
    ?>
<div id='mtp-plugin'>
    <pre style="display: none;">{{{JSON.stringify(settings)}}}</pre>
</div>
<?php

    }
}