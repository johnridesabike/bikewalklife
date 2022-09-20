function photo(data) {
  const div = document.createElement("div");
  div.className = "entry-page__webmentions-photo";
  const a = document.createElement("a");
  div.appendChild(a);
  a.href = data.url;
  a.className = "h-card u-url";
  const img = document.createElement("img");
  img.src = data.author.photo;
  img.alt = data.author.name;
  img.height = "48";
  img.width = "48";
  a.appendChild(img);
  return div;
}

function appendMentions(root, arr, title, className) {
  if (arr.length !== 0) {
    const h2 = document.createElement("h2");
    root.appendChild(h2);
    h2.className = "entry-page__webmentions-header";
    const text = document.createTextNode(title);
    h2.appendChild(text);
    const ul = document.createElement("ul");
    root.appendChild(ul);
    ul.className = className;
    arr.forEach((data) => {
      const li = document.createElement("li");
      ul.appendChild(li);
      li.className = "entry-page__webmentions-item";
      li.appendChild(photo(data));
    });
  }
}

function mentions(rootId, url) {
  fetch(
    "https://webmention.io/api/mentions.jf2?target=" + encodeURIComponent(url)
  )
    .then((response) => response.json())
    .then(({ children }) => {
      const reposts = children.filter((x) => x["wm-property"] === "repost-of");
      const likes = children.filter((x) => x["wm-property"] === "like-of");
      const root = document.getElementById(rootId);
      const div = document.createElement("div");
      root.appendChild(div);
      div.className = "entry-page__webmentions";
      appendMentions(
        div,
        reposts,
        "Retweeted by",
        "entry-page__webmentions-reposts"
      );
      appendMentions(div, likes, "Liked by", "entry-page__webmentions-likes");
    });
}
