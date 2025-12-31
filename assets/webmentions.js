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

function createMentions(arr, count, title, className) {
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
    // When a post is shared multiple times and the same people like or repost
    // it, they will appear multiple times. This dedupes them based on their
    // profile URL.
    let dedupe = new Set();
    for (let data of arr) {
      if (!dedupe.has(data.author.url)) {
        let li = document.createElement("li");
        ul.appendChild(li);
        li.className = "entry-page__webmentions-item";
        li.appendChild(createPhoto(data));
        dedupe.add(data.author.url);
      }
    }
    let diff = count - arr.length;
    if (diff > 0) {
      let li = document.createElement("li");
      ul.appendChild(li);
      li.className =
        "entry-page__webmentions-item entry-page__webmentions-count";
      let text = document.createTextNode("+" + diff);
      li.appendChild(text);
    }
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
    comments.className = "entry-page__webmentions-replies";
    for (let data of arr) {
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
    }
  }
  return frag;
}

async function fetchCount(params) {
  let response = await fetch(
    "https://webmention.io/api/count?" + new URLSearchParams(params).toString()
  );
  return response.json();
}

async function fetchMentions(params) {
  let response = await fetch(
    "https://webmention.io/api/mentions.jf2?" +
      new URLSearchParams(params).toString()
  );
  return response.json();
}

let emptyMentions = Promise.resolve({ children: [] });

async function run(root, target) {
  let count = await fetchCount([["target", target]]);
  let likes = count.type.like
    ? fetchMentions([
        ["wm-property", "like-of"],
        ["per-page", "5"],
        ["sort-dir", "down"],
        ["target", target],
      ])
    : emptyMentions;
  let reposts = count.type.repost
    ? fetchMentions([
        ["wm-property", "repost-of"],
        ["per-page", "5"],
        ["sort-dir", "down"],
        ["target", target],
      ])
    : emptyMentions;
  let replies =
    count.type.reply || count.type.mention
      ? fetchMentions([
          ["wm-property[]", "in-reply-to"],
          ["wm-property[]", "mention-of"],
          ["per-page", "20"],
          ["sort-dir", "up"],
          ["target", target],
        ])
      : emptyMentions;
  root.className = "entry-page__webmentions";
  root.appendChild(
    createMentions(
      (await reposts).children,
      count.type.repost,
      "Reposted by",
      "entry-page__webmentions-reposts"
    )
  );
  root.appendChild(
    createMentions(
      (await likes).children,
      count.type.like,
      "Liked by",
      "entry-page__webmentions-likes"
    )
  );
  // If I ever get enough replies I could add paging to this.
  root.appendChild(createReplies((await replies).children));
}

let root = document.getElementById("webmentions-root");
let canonicalUrl = document.getElementById("canonical-url");

if (root && canonicalUrl instanceof HTMLLinkElement) {
  run(root, canonicalUrl.href);
}
