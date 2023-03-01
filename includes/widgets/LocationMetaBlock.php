<?php

namespace MTP;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if (!defined('ABSPATH'))
    exit;

class LocationMetaBlock extends Widget_Base
{
    public function get_name()
    {
        return 'meta-block';
        # code...
    }

    public function __construct($data = [], $args = null)
    {
        parent::__construct($data, $args);
    }

    public function get_style_depends()
    {
        return ['frontend-style'];
    }

    public function get_title()
    {
        return 'Location Meta Block';
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
    protected function register_controls()
    {

        $this->start_controls_section(
            'Location Meta',
            [
                'label' => esc_html__('Marker Style', 'location-meta-widget'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'nusach_bg_color',
            [
                'label' => esc_html__('Nusach Background Color', 'location-meta-widget'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#ff7108',
                'selectors' => [
                    '{{WRAPPER}} .location-meta-tags span' => 'background-color: {{VALUE}};',
                ],
            ]
        );
        $this->add_control(
            'nusach_text_color',
            [
                'label' => esc_html__('Nusach Text Color', 'location-meta-widget'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#ffffff',
                'selectors' => [
                    '{{WRAPPER}} .location-meta-tags span' => 'color: {{VALUE}};',
                ],
            ]
        );
        $this->add_control(
            'link_color',
            [
                'label' => esc_html__('Link Color', 'location-meta-widget'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .location-meta-widget-link' => 'color: {{VALUE}};',
                ],
            ]
        );
        $this->add_control(
            'font_family',
            [
                'label' => esc_html__('Font Family', 'textdomain'),
                'type' => \Elementor\Controls_Manager::FONT,
                'default' => "'Open Sans', sans-serif",
                'selectors' => [
                    '{{WRAPPER}} .location-meta-widget' => 'font-family: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'spacing',
            [
                'label' => esc_html__('Spacing', 'location-meta-widget'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'em', 'rem'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                    'em' => [
                        'min' => 0,
                        'max' => 10,
                    ],
                    'rem' => [
                        'min' => 0,
                        'max' => 10,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 40,
                ],
                'selectors' => [
                    // '{{WRAPPER}} .location-meta-widget' => 'padding-left: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .location-meta-widget' => 'padding-inline-start: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();
    }


    //PHP RENDER
    protected function render()
    {
        global $post;
        global $wpdb;
        $zipCode = get_post_meta($post->ID, 'zipCode', true);
        $address = get_post_meta($post->ID, 'address', true);
        $state = get_post_meta($post->ID, 'state', true);
        $city = get_post_meta($post->ID, 'city', true);
        $website = get_post_meta($post->ID, 'website', true);
        $email = get_post_meta($post->ID, 'email', true);
        $phone = get_post_meta($post->ID, 'phone', true);
        $rabbi = get_post_meta($post->ID, 'rabbi', true);

        $time_records = $wpdb->get_results($wpdb->prepare("SELECT DISTINCT nusach FROM wp_times WHERE post_id = %s", $post->ID));


?>
        <span class="mtp-block location-meta-widget">

            <div class="location-meta-tags">
                <?php
                foreach ($time_records as $time) {
                    if ($time->nusach) {
                        echo "<span>" . $time->nusach . "</span>";
                    }
                }
                ?>
            </div>
            <h2 class="font-bold" style="font-weight: bold; font-size: 1.25rem; ">
                <?php echo $rabbi  ?>
            </h2>
            <br />
            <div>
                <span>
                    <?php echo $address  ?>
                </span><br />
                <span><?php echo ($city . ", " . $state . ", " . $zipCode)  ?></span>
            </div>
            <div style="margin-top: 5px;">
                <a class="location-meta-widget-link" rel="noopener" target="_blank" href="https://<?php echo $website  ?>">
                    <?php echo $website  ?>
                </a>
                <br />
                <a class="location-meta-widget-link" href="tel:<?php echo $phone  ?>">
                    <?php echo $phone  ?>
                </a>
                <br />
                <a class="location-meta-widget-link" href="mailto:<?php echo $email  ?>">
                    <?php echo $email  ?>
                </a>
            </div>
        </span>
    <?php

        # code...
    }
    protected function _content_template()
    {
        # code...
    ?>
        <span class='mtp-block location-meta-widget'>
            <div class="location-meta-tags">
                <span>Shacharis</span>
                <span>Mincha</span>
                <span>Mincha/Maariv</span>
                <span>Maariv</span>
            </div>
            <h2 class="font-bold" style="font-weight: bold; font-size: 1.25rem; ">
                Location Rabbi
            </h2>
            <br />
            <div>
                <span>
                    123 Main St
                </span><br />
                <span>City, State, ZipCode</span>
            </div>
            <div style="margin-top: 5px;">
                <a class="location-meta-widget-link" rel="noopener" target="_blank" href="https://google.com">
                    google.com
                </a>
                <br />
                <a class="location-meta-widget-link" href="tel:555-555-5555">
                    555-555-5555
                </a>
                <br />
                <a class="location-meta-widget-link" href="mailto:help@location.com">
                    help@location.com
                </a>
            </div>
        </span>
<?php

    }
}
