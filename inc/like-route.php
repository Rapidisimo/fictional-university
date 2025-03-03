<?php

add_action('rest_api_init', 'universityLikeRoutes'); //1st Param = WP Event we want to hook into | 2nd Param = function we will run

function universityLikeRoutes()
{
    register_rest_route('university/v1', 'manageLike', [
        'methods' => 'POST', //type of http request
        'callback' => 'createLike' //the function to run when we receive this request
    ]); // 1st param = begining part of the URL or namespace | 2nd param = name of this specific route or URL | 3rd param = an array with key value pairs

    register_rest_route('university/v1', 'manageLike', [
        'methods' => 'DELETE',
        'callback' => 'deleteLike'
    ]);
}


function createLike()
{
    return wp_send_json_success('Thanks for trying to create a like!');
}

function deleteLike()
{
    return wp_send_json_success('Thanks for trying to delete a like!');
}
