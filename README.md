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
smfAutoloader.getPosts(); // will return the posts
```

But there are three __Required__ parameters:

__Required Parameters -__
+ `maxPosts` - This is total number of posts to retrieve. smfAutoloader will divide this number by the amount of accounts you use.
+ `previousObject` - This is the object smfAutoloader will append its posts to. This is how it creates pagination.
+ `callback` - This is the custom function you define to handle the results (to put it onto the DOM)

```js
var posts;
function formatHTML (json) {}

smfAutoloader.getPosts(20, posts, formatHTML); // minimum to get the plugin to work
```

## Pagination

To add each call to the previous one, you must include a variable to append it to.

```js
var posts;
function formatHTML (json) {}

function getPosts () {
  posts = smfAutoloader.getPosts(20, posts, formatHTML); // this will set posts to be a javascript object from json
}
```

and then call it!

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

__1.0.0__

- Initial Release

