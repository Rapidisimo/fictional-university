<div class="generic-content">
    <form class="search-form" method="get" action="<?= esc_url(site_url('/')); ?>">
        <label for="s" class="headline headline--medium">Perform a New Search:</label>
        <div class="search-form-row">
            <input type="search" name="s" id="s" class="s" placeholder="What are you looking for?">
            <input type="submit" value="Search" class="search-submit">
        </div>
    </form>
</div>