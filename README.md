# eleventy-import-disqus

This is an intermediate step to migrate off of Disqus altogether but keep static copies of existing comment content.

## [Live demo](https://www.zachleat.com/web/23-minutes/) (scroll down)

## Benefits:

* Way speedier than Disqus and no third party JS.
* Comments available without JS.
* Properly maintains threading.
* Uses gravatar for avatar images.
* Works with any existing links to Disqus comments in the wild (and there isn’t an annoying delay while the Disqus loads and jumps to the comment).
* Full control over markup and style of comments (samples provided below).

## Drawbacks:

You’ll need a new mechanism to _add_ comments.

## Get your Disqus XML

1. Clone this this repository locally.
2. [Export your Disqus XML](https://help.disqus.com/developer/comments-export). `Disqus Admin > Community > Export and click "Export".`
3. Save your Disqus XML file as `input/disqus.xml` (overwrite the sample file).

## Map URLs to Local Template Files

The most annoying step of this process is creating your `input/contentMap.json` file (there is a sample file already in place). This maps each `path` of each Disqus comment thread to it’s eleventy template file.

```
Example disqus.xml thread url:
  <link>https://www.zachleat.com/web/23-minutes/</link>
```

This script will normalizes to the URL path, extracting `/web/23-minutes/` as the key. In my case, this url maps to `./_posts/2017-11-21-23-minutes-font-loading.md`. Each comment thread will need a map entry.

Open up `input/contentMap.json` to see an example.

You can use an `eleventy` template on your existing blog to generate this file for you! Try this `contentMap.njk` template:

```
---
permalink: contentMap.json
layout: false
---
{
{%- for post in collections.all %}
    "{{ post.url }}": "{{ post.inputPath }}",
{%- endfor -%}
}
```

You may have to modify the output a little bit but that’ll get you most of the way.

## Run this script

```
# Install the dependencies
npm install

# Generate the comment JSON files
npm run default
```

This will create a bunch of files in `output/`.

### `commentsCounts.json`

Copy this file into your `eleventy` blog’s `./_data` folder so that it’ll be available as the `commentsCounts` global.

I use `commentsCounts` to show comment counts on my home page big list of blog posts (on [zachleat.com](https://www.zachleat.com/web/)). Here’s my `liquid` template for that:

```
{% for post in collections.posts %}
  {%- if commentsCounts[post.url] > 0 %}<span title="{{ commentsCounts[post.url] }} comment{% if commentsCounts[post.url] != 1 %}s{% endif %}">📢 {{ commentsCounts[post.url] }}</span>{% endif -%}
{% endfor %}
```

### Individual template comments

The rest of the JSON files in `output` should have very similar names to your blog post entries. For example, `2017-11-21-23-minutes-font-loading.md` will use `2017-11-21-23-minutes-font-loading.json`. We want to copy these files to be in the same directory as our template files. In my case, this meant the `_posts` folder.

```
_posts/
  2017-11-21-23-minutes-font-loading.md
  2017-11-21-23-minutes-font-loading.json
```

Eleventy will now make this JSON data available automatically in our markdown template (these are known as [Template Specific Data Files](https://github.com/11ty/eleventy/blob/master/docs/data.md#template-and-directory-specific-data-files)).

Here’s how I used it (this is in my `post.liquid` layout template specifically for blog posts):

```html
<div class="static-comments">
    <!-- `id` for direct link to Comments section -->
    <h2 id="comments">
        {{ disqus.commentCount }} Comment{% if disqus.commentCount != 1 %}s{% endif %}
    </h2>
    {% for comment in disqus.comments %}
        {% include comment-entry.html %}
    {% endfor %}
</div>
```

Note that each `*.json` comment file has a top level `disqus` key in the object. We are referencing that in the template.

And then `comment-entry.html` file in `_includes/`:

```html
<div class="static-comments-reply" id="comment-{{ comment.postId }}">
    <div class="static-comments-hed">
        <img src="{{ comment.avatar }}" class="static-comments-img">
        <h3 class="static-comments-title">{{ comment.author }}</h3>
        <em class="static-comments-date"><a href="#comment-{{ comment.postId }}">{{ comment.date }}</a></em>
    </div>
    <div class="static-comments-msg">{{ comment.message }}</div>
    {% for reply in comment.replies %}
        {% include comment-entry.html, comment: reply %}
    {% endfor %}
</div>
```

I using `comment-postId` as the linkable ID for each individual comment to reuse the same convention that Disqus uses (it’ll maintain existing links to comments).

For good measure, here’s the CSS I used:

```css
.static-comments {
    font-size: 80%;
}
.static-comments-reply {
    margin: 1em 0 3em;
}
.static-comments-reply > .static-comments-reply {
    margin-top: 2em;
    padding-left: 1.5em;
    border-left: 4px solid #eee;
}
.static-comments-title {
    float: left;
    margin: 0;
}
.static-comments-img {
    float: left;
    max-width: 30px;
    margin-right: 1em;
    border-radius: 50%;
}
.static-comments-msg {
    clear: both;
    line-height: 1.7;
    margin-top: 1em;
    @include clearfix;
}
.static-comments-date {
    float: left;
    clear: left;
    font-size: 85%;
}

/* Clearfixes */
.static-comments-hed:before,
.static-comments-hed:after,
.static-comments-msg:before,
.static-comments-msg:after {
    content: " ";
    display: table;
}
.static-comments-hed:after,
.static-comments-msg:after {
    clear: both;
}
@media (min-width: 25em) { /* 400px */
    .static-comments-date {
        float: right;
        clear: none;
    }
}
```
