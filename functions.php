<?php

require get_theme_file_path('/inc/like-route.php');
require get_theme_file_path('/inc/search-route.php');

// Note that this is from the original fictional university custom theme folder.

function university_custom_rest() {
  register_rest_field('post', 'authorName', array(
    'get_callback' => function() {return get_the_author();}
  ));

  register_rest_field('note', 'userNoteCount', array(
    'get_callback' => function() {return count_user_posts(get_current_user_id(), 'note');}
  ));
}

add_action('rest_api_init', 'university_custom_rest');

function pageBanner($args = NULL) {
  
  if (!isset($args['title'])) {
    $args['title'] = get_the_title();
  }

  if (!isset($args['subtitle'])) {
    $args['subtitle'] = get_field('page_banner_subtitle');
  }

  if (!isset($args['photo'])) {
    if (get_field('page_banner_background_image') AND !is_archive() AND !is_home() ) {
      $args['photo'] = get_field('page_banner_background_image')['sizes']['pageBanner'];
    } else {
      $args['photo'] = get_theme_file_uri('/images/ocean.jpg');
    }
  }

  ?>
  <div class="page-banner">
    <div class="page-banner__bg-image" style="background-image: url(<?php echo $args['photo']; ?>);"></div>
    <div class="page-banner__content container container--narrow">
      <h1 class="page-banner__title"><?php echo $args['title'] ?></h1>
      <div class="page-banner__intro">
        <p><?php echo $args['subtitle']; ?></p>
      </div>
    </div>  
  </div>
<?php }

function university_files() {
  wp_enqueue_script('googleMap', '//maps.googleapis.com/maps/api/js?key=AIzaSyDin3iGCdZ7RPomFLyb2yqFERhs55dmfTI', NULL, '1.0', true);
  wp_enqueue_script('main-university-js', get_theme_file_uri('/build/index.js'), array('jquery'), '1.0', true);
  wp_enqueue_style('custom-google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
  wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
  wp_enqueue_style('university_extra_styles', get_theme_file_uri('/build/index.css'));

  wp_localize_script('main-university-js', 'universityData', array(
    'root_url' => get_site_url(),
    'nonce' => wp_create_nonce('wp_rest')
  ));

}

add_action('wp_enqueue_scripts', 'university_files');

function university_features() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  add_image_size('professorLandscape', 400, 260, true);
  add_image_size('professorPortrait', 480, 650, true);
  add_image_size('pageBanner', 1500, 350, true);
  //Normally we would build stand-alone plugins, but in this case, we are not splitting out the blocks from the theme. Since this is a block theme, we need styling to show in the block editor, not just on the front-end. So we are adding styling support for the post/page block editor screen:
  add_theme_support('editor-styles'); 
  add_editor_style(array('https://fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i', 'build/style-index.css', 'build/index.css'));
}

add_action('after_setup_theme', 'university_features');

function university_adjust_queries($query) {
  if (!is_admin() AND is_post_type_archive('campus') AND $query->is_main_query()) {
    $query->set('posts_per_page', -1);
  }

  if (!is_admin() AND is_post_type_archive('program') AND $query->is_main_query()) {
    $query->set('orderby', 'title');
    $query->set('order', 'ASC');
    $query->set('posts_per_page', -1);
  }

  if (!is_admin() AND is_post_type_archive('event') AND $query->is_main_query()) {
    $today = date('Ymd');
    $query->set('meta_key', 'event_date');
    $query->set('orderby', 'meta_value_num');
    $query->set('order', 'ASC');
    $query->set('meta_query', array(
              array(
                'key' => 'event_date',
                'compare' => '>=',
                'value' => $today,
                'type' => 'numeric'
              )
            ));
  }
}

add_action('pre_get_posts', 'university_adjust_queries');

function universityMapKey($api) {
  $api['key'] = 'yourKeyGoesHere';
  return $api;
}

add_filter('acf/fields/google_map/api', 'universityMapKey');

// Redirect subscriber accounts out of admin and onto homepage
add_action('admin_init', 'redirectSubsToFrontend');

function redirectSubsToFrontend() {
  $ourCurrentUser = wp_get_current_user();

  if (count($ourCurrentUser->roles) == 1 AND $ourCurrentUser->roles[0] == 'subscriber') {
    wp_redirect(site_url('/'));
    exit;
  }
}

add_action('wp_loaded', 'noSubsAdminBar');

function noSubsAdminBar() {
  $ourCurrentUser = wp_get_current_user();

  if (count($ourCurrentUser->roles) == 1 AND $ourCurrentUser->roles[0] == 'subscriber') {
    show_admin_bar(false);
  }
}

// Customize Login Screen
add_filter('login_headerurl', 'ourHeaderUrl');

function ourHeaderUrl() {
  return esc_url(site_url('/'));
}

add_action('login_enqueue_scripts', 'ourLoginCSS');

function ourLoginCSS() {
  wp_enqueue_style('custom-google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
  wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
  wp_enqueue_style('university_extra_styles', get_theme_file_uri('/build/index.css'));
}

add_filter('login_headertitle', 'ourLoginTitle');

function ourLoginTitle() {
  return get_bloginfo('name');
}

// Force note posts to be private
add_filter('wp_insert_post_data', 'makeNotePrivate', 10, 2);

function makeNotePrivate($data, $postarr) {
  if ($data['post_type'] == 'note') {
    if(count_user_posts(get_current_user_id(), 'note') > 4 AND !$postarr['ID']) {
      die("You have reached your note limit.");
    }

    $data['post_content'] = sanitize_textarea_field($data['post_content']);
    $data['post_title'] = sanitize_text_field($data['post_title']);
  }

  if($data['post_type'] == 'note' AND $data['post_status'] != 'trash') {
    $data['post_status'] = "private";
  }
  
  return $data;
}


// This is one way to add blocks, one by one. But there's an easier way, using classes instead:
// function bannerBlock() {
//   // bannerBlockScript is the name of the asset. second is the path to the file. Third is the dependency list:
//   wp_register_script('bannerBlockScript', get_stylesheet_directory_uri() . '/build/banner.js', array('wp-blocks', 'wp-editor'));
//   // namespace/name of this specific block. Second is the name of the asset. 
//   register_block_type("ourblocktheme/banner", array(
//     'editor_script' => 'bannerBlockScript'
//   ));
// }

// add_action('init', 'bannerBlock');


//This is a simple class method, without using the php render for banner.php:
// class JSXBlock {
//   function __construct($name) {
//     $this->name = $name;
//     add_action('init', [$this, 'onInit']);
//   }

//   function onInit() {
//     wp_register_script($this->name, get_stylesheet_directory_uri() . "/build/{$this->name}.js", array('wp-blocks', 'wp-editor'));
//     register_block_type("ourblocktheme/{$this->name}", array(
//       'editor_script' => $this->name
//     ));
//   }
// }

// // Our block names and file names are the same:
// new JSXBlock('banner');
// new JSXBlock('genericheading');
// new JSXBlock('genericbutton');

//New Method, since we now allowing some blocks to have a .php file (php render callback instead of just the js save function's generated string value that gets saved into the db) of files for our blocks:

class JSXBlock {
  function __construct($name, $renderCallback = null, $data = null) {
    $this->name = $name;
    $this->data = $data;
    $this->renderCallback = $renderCallback;
    add_action('init', [$this, 'onInit']);
  }

  // We are passing in $attributes from the registerBlockType's attributes section. $content could be nested blocks inside of the block.
  function ourRenderCallback($attributes, $content) {
    ob_start(); 
    require get_theme_file_path("/our-blocks/{$this->name}.php");
    return ob_get_clean(); 
  }

  function onInit() {
    wp_register_script($this->name, get_stylesheet_directory_uri() . "/build/{$this->name}.js", array('wp-blocks', 'wp-editor'));
    
    // wp_localize_script converts data from php to JS. -- wp_localize_script must be after wp_register_script.
    // First parameter is the script we are hooking onto.
    //Second argument is a made-up name for the js variable that will be output.
    //Third value is the data that you want to output.
    //Where you can find this date - in the post editor in the browser - right click - view page source - search for fallbackimage (what we named our property) -- you will see that the url we included in data is showing. -- now we can use this value in our client-side JavaScript.
    if ($this->data) {
      wp_localize_script($this->name, $this->name, $this->data);
    }

    $ourArgs = array(
      'editor_script' => $this->name
    );

    // If renderCallback is true we are adding a property on the array called render_callback -- It must be that name. It's set as a function we created above.
    if ($this->renderCallback) {
      $ourArgs['render_callback'] = [$this, 'ourRenderCallback'];
    }

    register_block_type("ourblocktheme/{$this->name}", $ourArgs);
  }
}

// True as the second parameter means we want to use a php render callback.
// Third parameter is a fall-back image. The reason we are adding this here is becuase in JS it's not so easy to get to the root directory. (In some cases the client could install wp in a sub-folder on their domain.)
new JSXBlock('banner', true, ['fallbackimage' => get_theme_file_uri('/images/library-hero.jpg')]);
new JSXBlock('genericheading');
new JSXBlock('genericbutton');
new JSXBlock('slideshow', true);
new JSXBlock('slide', true, ['themeimagepath' => get_theme_file_uri('/images/')]);
//Sometimes wp isn't installed at the root of the domain, so we need a way to get the path to the wp root and then to the images folder.

// Class made specifically for the eventsandblogs block. (That block doesn't use JSX, it uses createElement, so it's a bit different than the above ones.)
class PlaceholderBlock {
  function __construct($name) {
    $this->name = $name;
    add_action('init', [$this, 'onInit']);
  }

  function ourRenderCallback($attributes, $content) {
    ob_start();
    require get_theme_file_path("/our-blocks/{$this->name}.php");
    return ob_get_clean();
  }

  function onInit() {
    wp_register_script($this->name, get_stylesheet_directory_uri() . "/our-blocks/{$this->name}.js", array('wp-blocks', 'wp-editor'));
    
    register_block_type("ourblocktheme/{$this->name}", array(
      'editor_script' => $this->name,
      'render_callback' => [$this, 'ourRenderCallback']
    ));
  }
}

new PlaceholderBlock("eventsandblogs");
new PlaceholderBlock("header");
new PlaceholderBlock("footer");
new PlaceholderBlock("singlepost");
new PlaceholderBlock("page");
new PlaceholderBlock("blogindex");
new PlaceholderBlock("programarchive");
new PlaceholderBlock("singleprogram");
new PlaceholderBlock("singleprofessor");
new PlaceholderBlock("mynotes");
new PlaceholderBlock("archivecampus");
new PlaceholderBlock("archiveevent");
new PlaceholderBlock("archive");
new PlaceholderBlock("pastevents");
new PlaceholderBlock("search");
new PlaceholderBlock("searchresults");
new PlaceholderBlock("singlecampus");
new PlaceholderBlock("singleevent");


function myallowedblocks($allowed_block_types, $editor_context) {

  // If you only wanted a custom restriction for the professor post type:
    if ( $editor_context->post->post_type == "professor"){
      return array('ourblocktheme/header', 'ourblocktheme/footer', 'core/paragraph', 'core/list', 'core/heading');
    }

  // If you are on a page/post editor screen, then we are allowing all block types:
  if (!empty($editor_context->post)) {
    return $allowed_block_types;
  }

  // if you are on the FSE screen, then we are restricting to only allow these block types:
  return array('ourblocktheme/header', 'ourblocktheme/footer');
}

// Uncomment the line below if you actually want to restrict which block types are allowed
  // 1 - name of a wp-filter hook that we want to hook onto, 2- a function we make up, 3 - priority, 4 - how many arguments the function will use.

//add_filter('allowed_block_types_all', 'myallowedblocks', 10, 2);