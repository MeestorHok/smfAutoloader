# smfAutoloader
Javascript and PHP plugin to retrieve social media feeds from all of your accounts to create a dynamic blog.

Currently only works with Facebook and Instagram, but will soon be implementing

* Google+
* Twitter
* Tumblr
* Pinterest

as well as any others that people request.

__View an Example__ at [my blog](http://jmitchell.co/feed "Jake Mitchell's blog") on [my website](http://jmitchell.co "Jake Mitchell's website").

## Include the Plugin

To include, simply download the "smfAutoloader.js" file and the "secrets.php" file and add

```html
<script type="text/javascript" src="path/to/smfAutoloader.js"></script>
```

to the head of your document and then customize the secrets.php file to have your secrets.

You will have to create an app with each social media account, and then get the info from those sites to plug into the secrets page.

__Important:__ Make sure that `secrets.php` and `smfAutoloader.js` are in the __same__ folder.

## Implement the Code

Once you have properly linked everything, you will have to ask smfAutoloader to get your posts.

```js
smfAutoloader.getPosts(); // will fetch the posts, but it won't do anything with them.
```

Before it can do anything, it needs some parameters:

__Parameters -__
+ `callback` - __Required__. This is the custom function you define to handle the results.
+ `maxPosts` - This is total number of posts to retrieve. smfAutoloader will divide this number by the amount of accounts you use.
+ `secretsUrl` - This is the url of the secrets.php file smfAutoloader will retrieve its info from. by default, this is '/smfAutoloader/secrets.php'


```js
smfAutoloader.getPosts(formatHTML, 20, '/smfAutoloader/secrets.php'); // this will get 20 posts and send them to formatHTML in a JSON array
```

But what does the JSON array _look_ like?

## JSON Results

```js
  {
    "{Unix timestamp}" : {
      "username" : "{Username of user's account}",
      "mediaSrc" : "{What social media account the post is from}",
      "userLink" : "{Link to the user's account}",
      "timestamp" : "{Unix timestamp}",
      "post" : {
        "type" : "{Photo if there is an image, Status if just text}",
        "image" : "{Image of post}",
        "postText" : "{Text of post}",
        "postLink" : "{Link to post}",
        "numComments" : "{Number of comments on post}",
        "numLikes" : "{Number of likes on post}",
        "numRepubs" : "{Number of Repubs or Shares on post}",
      }
    }, 
    "{Another timestamp of next post}" : {}, ...
  }
```

Access these variables by iterating through all the posts:

```js
function formatHTML (json) { // this is the callback function
  var html = ''; // string to append all html to
  $.each(json, function (timestamp, post) { // then access each post individually
    html += '<article>';
      html += '<a href="' + post['userLink'] + '">';
        html += '<h1>' + post['username'] + '</h1>';
      html += '</a>';
      html += '<a href="' + post['post']['link'] + '">';
        html += '<img src="' + post['post']['image'] + '" />';
      html += '</a>';
    html += '</article>';
  }
  $('#posts').append(html); // add it to the DOM element of your choice
}
```

You can get way more detailed than that, but that is the basic setup!

## Pagination

Pagination is built into smfAutoloader, so all you have to do is have a callback that appends the results to the same element.

```js
function formatHTML (json) {
  // format JSON into HTML
  $('#posts').append(html); // you must APPEND the results to achieve pagination
}

function getPosts () {
  smfAutoloader.getPosts(formatHTML, 20, '/smfAutoloader/secrets.php');
}
```

> HTML results __MUST__ be appended to the element to avoid overriding the previous posts

Then just call it!

```js
$(window).on("load", function () {
  getPosts();
}
```
or
```html
<button onclick="getPosts()"></button>
```

## Change Log

__1.0.1__

- Moved to Promises instead of normal async to prepare for TDD
- Added files necessary to move to TDD
- Pagination is now inherently present by simply appending results to the same DOM element
- Added ability to use custom url for secrets.php

__1.0.0__

- Initial Release

