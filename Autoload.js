function date(format, timestamp) {
  //  discuss at: http://phpjs.org/functions/date/
  // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
  // original by: gettimeofday
  //    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: MeEtc (http://yass.meetcweb.com)
  // improved by: Brad Touesnard
  // improved by: Tim Wiel
  // improved by: Bryan Elliott
  // improved by: David Randall
  // improved by: Theriault
  // improved by: Theriault
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault
  // improved by: Thomas Beaucourt (http://www.webapp.fr)
  // improved by: JT
  // improved by: Theriault
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // improved by: Theriault
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: majak
  //    input by: Alex
  //    input by: Martin
  //    input by: Alex Wilson
  //    input by: Haravikk
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: majak
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
  // bugfixed by: Chris (http://www.devotis.nl/)
  //        note: Uses global: php_js to store the default timezone
  //        note: Although the function potentially allows timezone info (see notes), it currently does not set
  //        note: per a timezone specified by date_default_timezone_set(). Implementers might use
  //        note: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
  //        note: in order to adjust the dates in this function (or our other date functions!) accordingly
  //   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
  //   returns 1: '09:09:40 m is month'
  //   example 2: date('F j, Y, g:i a', 1062462400);
  //   returns 2: 'September 2, 2003, 2:26 am'
  //   example 3: date('Y W o', 1062462400);
  //   returns 3: '2003 36 2003'
  //   example 4: x = date('Y m d', (new Date()).getTime()/1000);
  //   example 4: (x+'').length == 10 // 2009 01 09
  //   returns 4: true
  //   example 5: date('W', 1104534000);
  //   returns 5: '53'
  //   example 6: date('B t', 1104534000);
  //   returns 6: '999 31'
  //   example 7: date('W U', 1293750000.82); // 2010-12-31
  //   returns 7: '52 1293750000'
  //   example 8: date('W', 1293836400); // 2011-01-01
  //   returns 8: '52'
  //   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
  //   returns 9: '52 2011-01-02'

  var that = this;
  var jsdate, f;
  // Keep this here (works, but for code commented-out below for file size reasons)
  // var tal= [];
  var txt_words = [
    'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // trailing backslash -> (dropped)
  // a backslash followed by any character (including backslash) -> the character
  // empty string -> empty string
  var formatChr = /\\?(.?)/gi;
  var formatChrCb = function(t, s) {
    return f[t] ? f[t]() : s;
  };
  var _pad = function(n, c) {
    n = String(n);
    while (n.length < c) {
      n = '0' + n;
    }
    return n;
  };
  f = {
    // Day
    d: function() { // Day of month w/leading 0; 01..31
      return _pad(f.j(), 2);
    },
    D: function() { // Shorthand day name; Mon...Sun
      return f.l()
        .slice(0, 3);
    },
    j: function() { // Day of month; 1..31
      return jsdate.getDate();
    },
    l: function() { // Full day name; Monday...Sunday
      return txt_words[f.w()] + 'day';
    },
    N: function() { // ISO-8601 day of week; 1[Mon]..7[Sun]
      return f.w() || 7;
    },
    S: function() { // Ordinal suffix for day of month; st, nd, rd, th
      var j = f.j();
      var i = j % 10;
      if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
        i = 0;
      }
      return ['st', 'nd', 'rd'][i - 1] || 'th';
    },
    w: function() { // Day of week; 0[Sun]..6[Sat]
      return jsdate.getDay();
    },
    z: function() { // Day of year; 0..365
      var a = new Date(f.Y(), f.n() - 1, f.j());
      var b = new Date(f.Y(), 0, 1);
      return Math.round((a - b) / 864e5);
    },

    // Week
    W: function() { // ISO-8601 week number
      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
      var b = new Date(a.getFullYear(), 0, 4);
      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
    },

    // Month
    F: function() { // Full month name; January...December
      return txt_words[6 + f.n()];
    },
    m: function() { // Month w/leading 0; 01...12
      return _pad(f.n(), 2);
    },
    M: function() { // Shorthand month name; Jan...Dec
      return f.F()
        .slice(0, 3);
    },
    n: function() { // Month; 1...12
      return jsdate.getMonth() + 1;
    },
    t: function() { // Days in month; 28...31
      return (new Date(f.Y(), f.n(), 0))
        .getDate();
    },

    // Year
    L: function() { // Is leap year?; 0 or 1
      var j = f.Y();
      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
    },
    o: function() { // ISO-8601 year
      var n = f.n();
      var W = f.W();
      var Y = f.Y();
      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
    },
    Y: function() { // Full year; e.g. 1980...2010
      return jsdate.getFullYear();
    },
    y: function() { // Last two digits of year; 00...99
      return f.Y()
        .toString()
        .slice(-2);
    },

    // Time
    a: function() { // am or pm
      return jsdate.getHours() > 11 ? 'pm' : 'am';
    },
    A: function() { // AM or PM
      return f.a()
        .toUpperCase();
    },
    B: function() { // Swatch Internet time; 000..999
      var H = jsdate.getUTCHours() * 36e2;
      // Hours
      var i = jsdate.getUTCMinutes() * 60;
      // Minutes
      var s = jsdate.getUTCSeconds(); // Seconds
      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
    },
    g: function() { // 12-Hours; 1..12
      return f.G() % 12 || 12;
    },
    G: function() { // 24-Hours; 0..23
      return jsdate.getHours();
    },
    h: function() { // 12-Hours w/leading 0; 01..12
      return _pad(f.g(), 2);
    },
    H: function() { // 24-Hours w/leading 0; 00..23
      return _pad(f.G(), 2);
    },
    i: function() { // Minutes w/leading 0; 00..59
      return _pad(jsdate.getMinutes(), 2);
    },
    s: function() { // Seconds w/leading 0; 00..59
      return _pad(jsdate.getSeconds(), 2);
    },
    u: function() { // Microseconds; 000000-999000
      return _pad(jsdate.getMilliseconds() * 1000, 6);
    },

    // Timezone
    e: function() { // Timezone identifier; e.g. Atlantic/Azores, ...
      // The following works, but requires inclusion of the very large
      // timezone_abbreviations_list() function.
      /*              return that.date_default_timezone_get();
       */
      throw 'Not supported (see source code of date() for timezone on how to add support)';
    },
    I: function() { // DST observed?; 0 or 1
      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
      // If they are not equal, then DST is observed.
      var a = new Date(f.Y(), 0);
      // Jan 1
      var c = Date.UTC(f.Y(), 0);
      // Jan 1 UTC
      var b = new Date(f.Y(), 6);
      // Jul 1
      var d = Date.UTC(f.Y(), 6); // Jul 1 UTC
      return ((a - c) !== (b - d)) ? 1 : 0;
    },
    O: function() { // Difference to GMT in hour format; e.g. +0200
      var tzo = jsdate.getTimezoneOffset();
      var a = Math.abs(tzo);
      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
    },
    P: function() { // Difference to GMT w/colon; e.g. +02:00
      var O = f.O();
      return (O.substr(0, 3) + ':' + O.substr(3, 2));
    },
    T: function() { // Timezone abbreviation; e.g. EST, MDT, ...
      // The following works, but requires inclusion of the very
      // large timezone_abbreviations_list() function.
      /*              var abbr, i, os, _default;
      if (!tal.length) {
        tal = that.timezone_abbreviations_list();
      }
      if (that.php_js && that.php_js.default_timezone) {
        _default = that.php_js.default_timezone;
        for (abbr in tal) {
          for (i = 0; i < tal[abbr].length; i++) {
            if (tal[abbr][i].timezone_id === _default) {
              return abbr.toUpperCase();
            }
          }
        }
      }
      for (abbr in tal) {
        for (i = 0; i < tal[abbr].length; i++) {
          os = -jsdate.getTimezoneOffset() * 60;
          if (tal[abbr][i].offset === os) {
            return abbr.toUpperCase();
          }
        }
      }
      */
      return 'UTC';
    },
    Z: function() { // Timezone offset in seconds (-43200...50400)
      return -jsdate.getTimezoneOffset() * 60;
    },

    // Full Date/Time
    c: function() { // ISO-8601 date.
      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
    },
    r: function() { // RFC 2822
      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
    },
    U: function() { // Seconds since UNIX epoch
      return jsdate / 1000 | 0;
    }
  };
  this.date = function(format, timestamp) {
    that = this;
    jsdate = (timestamp === undefined ? new Date() : // Not provided
      (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
      new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
    );
    return format.replace(formatChr, formatChrCb);
  };
  return this.date(format, timestamp);
} // php date function for JS from http://phpjs.org/functions/date/

function ucfirst(str) { 
    return str.charAt(0).toUpperCase() + str.slice(1); 
} // php ucfirst function for JS from http://www.corelangs.com/js/string/cap.html#sthash.H5Mt7Hst.dpuf

var mGrid = new (function () {
    "use strict";
    var self = this;
    
    var colCount = 0,
        colWidth = 0,
        margin = 20,
        marginWidth = 0,
        contentWidth = 0,
        blocks = [];
    
    // Function to get the Min value in Array
    Array.min = function(array) {
        return Math.min.apply(Math, array);
    };
    
    self.setupBlocks = function () {
        var windowWidth = $(window).width();
    	contentWidth = $('#posts').width();
    	marginWidth = (windowWidth - contentWidth) / 2;
    	colWidth = $('.smfPost').outerWidth();
    	blocks = [];
    	colCount = Math.floor(contentWidth / (colWidth + margin * 2));
    	for(var i = 0;i < colCount; i++){
    		blocks.push(margin);
    	}
    	self.positionBlocks();
    };
    
    self.positionBlocks = function () {
    	$('.smfPost').each(function(){
    		var min = Array.min(blocks);
    		var index = $.inArray(min, blocks);
    		var leftPos = margin + (index * (colWidth + margin)) + marginWidth;
    		$(this).css({
    			'left' : leftPos + 'px',
    			'top' : min + 'px'
    		});
    		blocks[index] = min + $(this).outerHeight() + margin;
    	});	
    };
    
    return self;
    
})(); // grid: for positioning dynamic grid

var smfAutoloader = new (function () {
    "use strict";
    var self = this,
        results = '{',
        instaDone = false,
        googDone = false,
        faceDone = false,
        twitDone = false;
    
    self.getPosts = function (maxPosts, iter) {
        iter = iter || 'first';
        instaDone = false;
        googDone = true; // switch to false once google code is implemented
        faceDone = true; // switch to false once facebook code is implemented
        twitDone = true; // switch to false once twitter code is implemented
        
        var perSrc = Math.floor(maxPosts / 4);
        
        if (iter == 'next') { // if retrieving new posts
            self.getInstagram.next(perSrc);
        } else { // first retrieval of posts
            self.getInstagram.run(perSrc);
        }
    };
    
    /*Instagram Retrieval*/
    self.getInstagram = new (function () {
      "use strict";
      var instafeed;
      
      function get (maxPosts) { // remove instafeed dependency
          instafeed = new Instafeed({
              get: 'user',
              userId: 2174451614, // my personal instagram id
              target: 'posts',
              sortBy: 'most-recent',
              limit: maxPosts,
              mock: true,
              success: smfAutoloader.formatInstagramJSON,
              resolution: 'standard_resolution',
              accessToken: '2174451614.0ae2446.f78af7031d1d4f3fb1f7234fae64e9b8' // make this auto-generated
          });
      }
      
      function next (maxPosts) {
          get(maxPosts);
          instafeed.next();
      }
      
      function run (maxPosts) {
          get(maxPosts);
          instafeed.run();
      }
      
      var that = {
        run : run,
        next : next,
        get : get
      };
      
      return that;
    })();
    /*Instagram JSON formatting for a universal JSON format*/
    self.formatInstagramJSON = function (jsonPosts) {
        var instagramJSON = '"instagram" : {';
        
        for (var i = 0; i < jsonPosts['data'].length; i++) {
            var post = jsonPosts['data'][i],
                picText = post['caption']['text'],
                picUsername = post['user']['username'],
                picUserLink = 'https://www.instagram.com/'+post['user']['username']+'/',
                picLink = post['link'],
                picLikeCount = post['likes']['count'],
                picCommentCount = post['comments']['count'],
                picSrc = post['images']['standard_resolution']['url'],
                picTimestampFormatted = date("ymdHis", post['created_time']); // yymmddhhmmss
            
            instagramJSON += '"'+picTimestampFormatted+'" : {';
            instagramJSON += '"username" : "'+picUsername+'",';
            instagramJSON += '"userLink" : "'+picUserLink+'",';
            instagramJSON += '"post" : {';
                instagramJSON += '"type" : "photo",';
                instagramJSON += '"image" : "'+picSrc+'",';
                instagramJSON += '"postLink" : "'+picLink+'",';
                instagramJSON += '"postText" : "'+picText+'",';
                instagramJSON += '"shareLink" : "",';
                instagramJSON += '"shareTitle" : "",';
                instagramJSON += '"shareText" : "",';
                instagramJSON += '"numLikes" : "'+picLikeCount+'",';
                instagramJSON += '"numComments" : "'+picCommentCount+'",';
                instagramJSON += '"numRepubs" : ""}';
            instagramJSON += '},';
        }
        if (instagramJSON[instagramJSON.length - 1] == ',') {
            instagramJSON = instagramJSON.substring(0, instagramJSON.length - 1);
        }
        results += instagramJSON + '},';
        instaDone = true;
        self.finish();
    };
    /**/
    
    /*Finish and return HTML formatted posts*/
    self.formatHTML = function () {
        if (results[results.length - 1] == ',') {
            results = results.substring(0, results.length - 1);
        }
        results += '}';
        
        var json = JSON.parse(results);
        var html = "";
        
        $.each(json, function (mediaSrc,posts) {
            $.each(posts, function (timestamp,post) {
                html += "<article class='smfPost'>";
                    if(post['post']['type'] == 'photo') {
                        html += "<div class='smfMasthead'>";
                            html += "<span class='smfCornerCut'></span>";
                            html += "<a class='smfCornerColor smf"+ucfirst(mediaSrc)+"'href='"+post['userLink']+"' target='_blank' title='"+ucfirst(mediaSrc)+": "+post['username']+"'></a>";
                            html += "<i class='fa fa-"+mediaSrc+" smfCornerIcon'></i>";
                            html += "<a class='smfPicture' href='"+post['post']['postLink']+"' target='_blank'>";
                                html += "<img src='"+post['post']['image']+"' alt='"+post['post']['postText']+"' />";
                            html += "</a>";
                        html += "</div>";
                    }
                    else if (post['post']['type'] == 'status') {
                        html += "<div class='smfStatus'>";
                            html += "<span class='smfCornerCut'></span>";
                            html += "<a class='smfCornerColor smf"+ucfirst(mediaSrc)+"'href='"+post['userLink']+"' target='_blank' title='"+ucfirst(mediaSrc)+": "+post['username']+"'></a>";
                            html += "<i class='fa fa-"+mediaSrc+" smfCornerIcon'></i>";
                        html += "</div>";
                    }
                    html += "<p class='smfText'>"+post['post']['postText']+"</p>";
                    html += "<div class='smfDetails'>";
                        html += "<span class='smfDate'>"+date("F j, Y", timestamp)+"</span>";
                        html += "<span class='smfViews'>"+post['post']['numLikes']+"&nbsp;<i class='fa fa-heart-o'></i>";
                        if (mediaSrc == 'facebook' || mediaSrc == 'instagram' || mediaSrc == 'google') {
                            html += "&nbsp;&nbsp;"+post['post']['numComments']+"&nbsp;<i class='fa fa-comments-o'></i>";
                        }
                        if (mediaSrc == 'facebook' || mediaSrc == 'twitter' || mediaSrc == 'google' || mediaSrc == 'tumblr') {
                            html += "&nbsp;&nbsp;"+post['post']['numRepubs']+"&nbsp;<i class='fa fa-retweet'></i>";
                        }
                        html += "</span>";
                    html += "</div>";
                html += "</article>";
            });
        });
        
        $('#posts').append(html);
        $('#posts').append("<button class='smfPost' type='button' onclick=\"smfAutoloader.getPosts(20, 'next')\">Load More</button>");
        mGrid.setupBlocks();
    };
    self.finish = function () {
        if (instaDone && faceDone && twitDone && googDone) 
                self.formatHTML();
    };
    return self;
})(); // smfAutoloader: makes AJAX calls to PHP to retrieve social media posts
/**/

$(window).on("load", function () { // once everything is loaded
    smfAutoloader.getPosts(20);
});

window.addEventListener('resize', function () { mGrid.setupBlocks(); }, false);