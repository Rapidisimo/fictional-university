<?php
get_header();
while (have_posts()) {
    the_post();
    pageBanner();
?>

    <div class="container container--narrow page-section">
        <?php
        $theParent = wp_get_post_parent_id(get_the_ID());
        if ($theParent) : ?>
            <div class="metabox metabox--position-up metabox--with-home-link">
                <p>
                    <a class="metabox__blog-home-link" href="<?= get_permalink($theParent); ?>"><i class="fa fa-home" aria-hidden="true"></i> Back to <?= get_the_title($theParent) ?></a> <span class="metabox__main"><?= the_title(); ?></span>
                </p>
            </div>
        <?php endif ?>
        <?php
        $parentTest = get_pages([
            'child_of' => get_the_ID(),
        ]);
        if ($theParent || $parentTest) : ?>
            <div class="page-links">
                <h2 class="page-links__title"><a href="<?= get_permalink($theParent); ?>"><?= get_the_title($theParent); ?></a></h2>
                <ul class="min-list">
                    <?php
                    if ($theParent) {
                        $findChildrenOf = $theParent;
                    } else {
                        $findChildrenOf = get_the_ID();
                    }
                    wp_list_pages([
                        'title_li' => NULL,
                        'child_of' => $findChildrenOf,
                    ]);
                    ?>
                </ul>
            </div>
        <?php endif ?>

        <?php get_search_form(); ?>
    </div>
<?php }

get_footer();
?>