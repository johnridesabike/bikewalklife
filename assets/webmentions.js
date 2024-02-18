"use strict";

function createPhoto(data, alt) {
  let div = document.createElement("div");
  div.className = "entry-page__webmentions-photo";
  let a = document.createElement("a");
  div.appendChild(a);
  a.rel = "noopener nofollow";
  a.href = data.url;
  a.className = "h-card u-url";
  let img = document.createElement("img");
  a.appendChild(img);
  img.src = data.author.photo;
  img.alt = alt ? alt : data.author.name;
  img.height = 48;
  img.width = 48;
  return div;
}

function createMentions(arr, title, className) {
  let frag = document.createDocumentFragment();
  if (arr.length !== 0) {
    let h2 = document.createElement("h2");
    frag.appendChild(h2);
    h2.className = "entry-page__webmentions-header";
    let text = document.createTextNode(title);
    h2.appendChild(text);
    let ul = document.createElement("ul");
    frag.appendChild(ul);
    ul.className = className;
    arr.forEach((data) => {
      let li = document.createElement("li");
      ul.appendChild(li);
      li.className = "entry-page__webmentions-item";
      li.appendChild(createPhoto(data));
    });
  }
  return frag;
}

let dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function createReplies(arr) {
  let frag = document.createDocumentFragment();
  if (arr.length !== 0) {
    let h2 = document.createElement("h2");
    frag.appendChild(h2);
    h2.className = "entry-page__webmentions-header";
    let text = document.createTextNode("Replies from around the web");
    h2.appendChild(text);
    let comments = document.createElement("div");
    frag.appendChild(comments);
    comments.clasName = "entry-page__webmentions-replies";
    arr.forEach((data) => {
      let comment = document.createElement("article");
      comments.appendChild(comment);
      comment.className = "h-entry entry-page__webmentions-reply";
      let header = document.createElement("header");
      comment.appendChild(header);
      header.className = "h-card p-author";
      header.appendChild(createPhoto(data, "Author photo."));
      let authorLink = document.createElement("a");
      header.appendChild(authorLink);
      header.className = "entry-page__webmentions-author entry__author";
      authorLink.rel = "noopener nofollow";
      authorLink.href = data.author.url;
      authorLink.appendChild(document.createTextNode(data.author.name));
      let content = document.createElement("p");
      comment.appendChild(content);
      content.className = "e-content entry-page__webmentions-reply-content";
      let text = data.content.text.split("\n");
      content.appendChild(document.createTextNode(text[0]));
      for (let i = 1; i < text.length; i++) {
        content.appendChild(document.createElement("br"));
        content.appendChild(document.createTextNode(text[i]));
      }
      let footer = document.createElement("footer");
      comment.appendChild(footer);
      footer.className = "entry-page__webmentions-footer";
      let time = document.createElement("time");
      footer.appendChild(time);
      time.dateTime = data.published;
      time.className = "entry-page__webmentions-date dt-published";
      time.appendChild(
        document.createTextNode(dateFormat.format(new Date(data.published)))
      );
      let link = document.createElement("a");
      footer.appendChild(link);
      link.rel = "nofollow";
      link.href = data.url;
      let url = new URL(data.url);
      link.appendChild(
        document.createTextNode("Posted on " + url.hostname + ".")
      );
    });
  }
  return frag;
}

let canonicalUrl = document.getElementById("canonical-url");

if (canonicalUrl instanceof HTMLLinkElement) {
  fetch(
    "https://webmention.io/api/mentions.jf2?sort-dir=up&target=" +
      encodeURIComponent(canonicalUrl.href)
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.children.length > 0) {
        let reposts = [];
        let likes = [];
        let replies = [];
        response.children.forEach((x) => {
          switch (x["wm-property"]) {
            case "repost-of":
              reposts.push(x);
              break;
            case "like-of":
            case "bookmark-of":
              likes.push(x);
              break;
            case "mention-of":
            case "in-reply-to":
              replies.push(x);
              break;
          }
        });
        let root = document.getElementById("webmentions-root");
        root.className = "entry-page__webmentions";
        let hr = document.createElement("hr");
        hr.className = "separator";
        root.appendChild(hr);
        root.appendChild(
          createMentions(
            reposts,
            "Reposted by",
            "entry-page__webmentions-reposts"
          )
        );
        root.appendChild(
          createMentions(likes, "Liked by", "entry-page__webmentions-likes")
        );
        root.appendChild(createReplies(replies));
      }
    });
}
