<?php

require get_theme_file_path('/inc/search-route.php');

function university_custom_rest() // Adding a new field to the REST API
{
    register_rest_field('post', 'author_name', [
        'get_callback' => function () {
            return get_the_author();
        }
    ]);
}

add_action('rest_api_init', 'university_custom_rest');

function pageBanner($args = null)
{
    if (!isset($args['title'])) {
        $args['title'] = get_the_title();
    }
    if (!isset($args['subtitle'])) {
        $args['subtitle'] = get_field('page_banner_subtitle');
    }
    if (!isset($args['photo'])) {
        if (get_field('page_banner_background_image') && !is_archive() && !is_home()) {
            $args['photo'] = get_field('page_banner_background_image')['sizes']['pageBanner'];
        } else {
            $args['photo'] = get_theme_file_uri('/images/ocean.jpg');
        }
    }

?>
    <div class="page-banner">
        <div class="page-banner__bg-image" style="background-image: url(<?php echo $args['photo'];  ?>);"></div>
        <div class="page-banner__content container container--narrow">
            <h1 class="page-banner__title"><?php echo $args['title'] ?></h1>
            <div class="page-banner__intro">
                <p><?= $args['subtitle'] ?></p>
            </div>
        </div>
    </div>
<?php
}

function university_files()
{
    $api_key = defined('GOOGLE_MAPS_API_KEY') ? GOOGLE_MAPS_API_KEY : '';
    if ($api_key) {
        wp_enqueue_script('googleMap', '//maps.googleapis.com/maps/api/js?key=' . esc_attr(($api_key)), null, '1.0', true);
    }
    wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
    wp_enqueue_style('university_extra_styles', get_theme_file_uri('/build/index.css'));
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    wp_enqueue_style('google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
    wp_enqueue_script('main-university-js', get_theme_file_uri('/build/index.js'), array('jquery'), '1.0', true);
    wp_localize_script('main-university-js', 'universityData', [
        'root_url' => get_site_url(),
        'nonce' => wp_create_nonce('wp_rest')
    ]);
}

add_action('wp_enqueue_scripts', 'university_files');

function university_features()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_image_size('professorLandscape', 400, 260, true);
    add_image_size('professorPortrait', 480, 650, true);
    add_image_size('pageBanner', 1500, 350, true);
    // Commented these out because for the course, the instructor did manual menus instead
    // register_nav_menu('headerMenuLocation', 'Header Menu Location');
    // register_nav_menu('footerMenuLocation1', 'Footer Menu Location 1');
    // register_nav_menu('footerMenuLocation2', 'Footer Menu Location 2');
}

add_action('after_setup_theme', 'university_features');

function university_adjust_queries($query)
{
    if (!is_admin() && is_post_type_archive('campus') && $query->is_main_query()) {
        $query->set('posts_per_page', '-1');
    }

    if (!is_admin() && is_post_type_archive('program') && $query->is_main_query()) {
        $query->set('orderby', 'title');
        $query->set('order', 'ASC');
        $query->set('posts_per_page', '-1');
    }

    if (!is_admin() && is_post_type_archive('event') && $query->is_main_query()) {
        $today = date('Ymd');
        $query->set('meta_key', 'event_date');
        $query->set('orderby', 'meta_value_num');
        $query->set('order', 'ASC');
        $query->set('meta_query', [
            [
                'key' => 'event_date',
                'compare' => '>=',
                'value' => $today,
                'type' => 'numeric',
            ]
        ]);
    }
}

add_action('pre_get_posts', 'university_adjust_queries');

function universityMapKey($api)
{
    $api_key = defined('GOOGLE_MAPS_API_KEY') ? GOOGLE_MAPS_API_KEY : '';
    $api['key'] = esc_attr(($api_key));
    return $api;
}

add_filter('acf/fields/google_map/api', 'universityMapKey');

// Redirect users after login

add_action('admin_init', 'redirectSubsToFrontend');

function redirectSubsToFrontend()
{
    $ourCurrentUser = wp_get_current_user();

    if (count($ourCurrentUser->roles) === 1 && $ourCurrentUser->roles[0] === 'subscriber') {
        wp_redirect(site_url('/'));
        exit;
    }
}

// Hide admin bar for subscribers

add_action('wp_loaded', 'noSubsAdminBar');

function noSubsAdminBar()
{
    $ourCurrentUser = wp_get_current_user();

    if (count($ourCurrentUser->roles) === 1 && $ourCurrentUser->roles[0] === 'subscriber') {
        show_admin_bar(false);
    }
}


// Customized login screen

add_filter('login_headerurl', 'ourHeaderUrl');

function ourHeaderUrl()
{
    return esc_url(site_url('/'));
}

// Override login css to use our theme css
add_action('login_enqueue_scripts', 'ourLoginCss');

function ourLoginCss()
{
    wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
    wp_enqueue_style('university_extra_styles', get_theme_file_uri('/build/index.css'));
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    wp_enqueue_style('google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
    wp_enqueue_script('googleMap', '//maps.googleapis.com/maps/api/js?key=AIzaSyBYkrVMvbwZ1nnVfczfcb1homOcW9_GblM', null, '1.0', true);
}

// Change the header to our site name
add_filter('login_headertitle', 'ourLoginTitle');

function ourLoginTitle()
{
    return get_bloginfo('name');
}

// Force note posts to be private
add_filter('wp_insert_post_data', 'makeNotePrivate', 10, 2); //added 10 for the default priority (priority decides which function runs first) and 2 so it can take in two parameters

function makeNotePrivate($data, $postarr)
{
    // increase security by stripping basic html and limit note post quantity
    if ($data['post_type'] === 'note') {
        if (count_user_posts(get_current_user_id(), 'note') > 4 && !$postarr['ID']) {
            die("You have reached your note limit.");
        }

        $data['post_content'] = sanitize_textarea_field($data['post_content']);
        $data['post_title'] = sanitize_text_field($data['post_title']);
    }
    // set notes to private
    if ($data['post_type'] === 'note' && $data['post_status'] != "trash") {
        $data['post_status'] = "private";
    }
    return $data;
}
