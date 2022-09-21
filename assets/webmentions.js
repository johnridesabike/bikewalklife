"use strict";

function createPhoto(data) {
  const div = document.createElement("div");
  div.className = "entry-page__webmentions-photo";
  const a = document.createElement("a");
  div.appendChild(a);
  a.href = data.url;
  a.className = "h-card u-url";
  const img = document.createElement("img");
  a.appendChild(img);
  img.src = data.author.photo;
  img.alt = data.author.name;
  img.height = 48;
  img.width = 48;
  return div;
}

function createMentions(arr, title, className) {
  const frag = document.createDocumentFragment();
  if (arr.length !== 0) {
    const h2 = document.createElement("h2");
    frag.appendChild(h2);
    h2.className = "entry-page__webmentions-header";
    const text = document.createTextNode(title);
    h2.appendChild(text);
    const ul = document.createElement("ul");
    frag.appendChild(ul);
    ul.className = className;
    arr.forEach((data) => {
      const li = document.createElement("li");
      ul.appendChild(li);
      li.className = "entry-page__webmentions-item";
      li.appendChild(createPhoto(data));
    });
  }
  return frag;
}

const canonicalUrl = document.getElementById("canonical-url");

if (canonicalUrl instanceof HTMLLinkElement) {
  const encodedUrl = encodeURIComponent(canonicalUrl.href);
  fetch("https://webmention.io/api/mentions.jf2?target=" + encodedUrl)
    .then((response) => response.json())
    .then(({ children }) => {
      const reposts = children.filter((x) => x["wm-property"] === "repost-of");
      const likes = children.filter((x) => x["wm-property"] === "like-of");
      const root = document.getElementById("webmentions-root");
      const div = document.createElement("div");
      div.className = "entry-page__webmentions";
      div.appendChild(
        createMentions(
          reposts,
          "Retweeted by",
          "entry-page__webmentions-reposts"
        )
      );
      div.appendChild(
        createMentions(likes, "Liked by", "entry-page__webmentions-likes")
      );
      root.appendChild(div);
    });
}
