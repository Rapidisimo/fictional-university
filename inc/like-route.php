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


function createLike($data) //adding a parameter to access the data being sent back
{
    if (is_user_logged_in()) {
        $professor = sanitize_text_field($data['professorId']);

        $existQuery = new WP_Query([
            'author'    => get_current_user_id(),
            'post_type' => 'like',
            'meta_query' => [
                [
                    'key'       => 'liked_professor_id',
                    'compare'   => '=',
                    'value'     => $professor,
                ]
            ]
        ]);

        if ($existQuery->found_posts === 0 && get_post_type($professor) === 'professor') {
            // create new like post
            $newLikeId = wp_insert_post([
                'post_type' => 'like',
                'post_status' => 'publish',
                'post_title' => 'Like post for professor ' . $professor,
                'meta_input' => [ //acf field that we'll assign a value
                    'liked_professor_id' => $professor
                ],
            ]);

            if ($newLikeId) {
                return rest_ensure_response([
                    'message' => 'Like created successfully',
                    'likeId' => $newLikeId
                ]);
            } else {
                return new WP_Error('cant-create-like', 'Failed to create like', ['status' => 500]);
            }
        } else {
            return new WP_Error('invalid-prof-id', 'Invalid professor ID.', ['status' => 500]);
        }
    } else {
        return new WP_Error('not-logged-in', 'Only logged in users can create a like.', ['status' => 403]);
    }
}

function deleteLike()
{
    return rest_ensure_response([
        'message' => 'Like delete successfully'
    ]);
}
