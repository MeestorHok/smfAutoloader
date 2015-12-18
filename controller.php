<?php

require_once('facebook.php');
require_once('instagram.php');
//require_once('twitter.php');
//require_once('tumblr.php');

$maxPosts = floor($_POST['maxPosts'] / 5);

$face = new smfFacebook($maxPosts);
$insta = new smfInstagram($maxPosts);
//$twit = new smfTwitter($maxPosts);
//$tumbl = new smfTumblr($maxPosts);

$results = '{';

$results .= $face->getPosts();
$results .= $insta->getPosts();
//$results = $twit->getPosts();
//$results .= $tumbl->getPosts();

$results = rtrim($results, ",");
$results .= '}';

$postsArray = json_decode($results, true);
sort($postsArray, SORT_NUMERIC);

/* posts array reference

"timestamp" : {
    "mediaSrc" : "",
    "username" : "",
    "userLink" : "",
    "timestamp" : "",
    
    "post" : {
        "type" : "",
        "image" : "",
        "postLink" : "",
        "postText" : "",
        "shareLink" : "",
        "shareTitle" : "",
        "shareText" : "",
        "numLikes" : "",
        "numComments" : "",
        "numRepubs" : ""
    }
},
*/
$results = "";

foreach ($postsArray as $post) {
    $results .= "<article class='smfPost'>";
        if($post['post']['type'] == 'photo') {
            $results .= "<div class='smfMasthead'>";
                $results .= "<span class='smfCornerCut'></span>";
                $results .= "<a class='smfCornerColor smf".ucfirst($post['mediaSrc'])."'href='".$post['userLink']."' target='_blank' title='".ucfirst($post['mediaSrc']).": ".$post['username']."'></a>";
                $results .= "<i class='fa fa-".$post['mediaSrc']." smfCornerIcon'></i>";
                $results .= "<a class='smfPicture' href='".$post['post']['postLink']."' target='_blank'>";
                    $results .= "<img src='".$post['post']['image']."' alt='".$post['post']['postText']."' />";
                $results .= "</a>";
            $results .= "</div>";
        }
        else if ($post['post']['type'] == 'status') {
            $results .= "<div class='smfStatus'>";
                $results .= "<span class='smfCornerCut'></span>";
                $results .= "<a class='smfCornerColor smf".ucfirst($post['mediaSrc'])."'href='".$post['userLink']."' target='_blank' title='".ucfirst($post['mediaSrc']).": ".$post['username']."'></a>";
                $results .= "<i class='fa fa-".$post['mediaSrc']." smfCornerIcon'></i>";
            $results .= "</div>";
        }
        $results .= "<p class='smfText'>".$post['post']['postText']."</p>";
        $results .= "<div class='smfDetails'>";
            $results .= "<span class='smfDate'>".date("F j, Y", $post['timestamp'])."</span>";
            $results .= "<span class='smfViews'>".$post['post']['numLikes']."&nbsp;<i class='fa fa-heart-o'></i>";
            if ($post['mediaSrc'] == 'facebook' || $post['mediaSrc'] == 'instagram' || $post['mediaSrc'] == 'google') {
                $results .= "&nbsp;&nbsp;".$post['post']['numComments']."&nbsp;<i class='fa fa-comments-o'></i>";
            }
            if ($post['mediaSrc'] == 'facebook' || $post['mediaSrc'] == 'twitter' || $post['mediaSrc'] == 'google' || $post['mediaSrc'] == 'tumblr') {
                $results .= "&nbsp;&nbsp;".$post['post']['numRepubs']."&nbsp;<i class='fa fa-retweet'></i>";
            }
            $results .= "</span>";
        $results .= "</div>";
    $results .= "</article>";
}

echo json_encode($results);


?>