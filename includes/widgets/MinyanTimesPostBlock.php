<?php

namespace MTP;

use Elementor\Widget_Base;

if (!defined('ABSPATH'))
    exit;

class MinyanTimesPostBlock extends Widget_Base
{
    public function get_name()
    {
        return 'minyan-times-post-block';
        # code...
    }

    public function __construct($data = [], $args = null)
    {
        parent::__construct($data, $args);
    }



    public function get_script_depends()
    {
        return ['post-block-script'];
    }

    public function get_style_depends()
    {
        return ['frontend-style'];
    }

    public function get_title()
    {
        return 'Minyan Times Post Block';
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
    }

    //PHP RENDER
    protected function render()
    {
        global $post;
        $attributes = $this->get_settings_for_display();
        $attributes["googleKey"] = get_option("mtp_google_api_key");

?>
        <div id="mtp-post-block">
            <pre style="display: none;"><?php echo wp_json_encode($attributes) ?></pre>
        </div>
    <?php

        # code...
    }
    protected function _content_template()
    {
        # code...
    ?>
        <div id='mtp-post-block'>
            <pre style="display: none;">{{{JSON.stringify(settings)}}}</pre>
        </div>
<?php

    }
}
