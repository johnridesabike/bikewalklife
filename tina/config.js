import { defineConfig } from "tinacms";
import slugify from "@sindresorhus/slugify";
import authorData from "../_data/authors.json";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "master";

const clientId = process.env.TINA_CLIENT_ID || "";
const token = process.env.TINA_TOKEN || "";

function nonEmpty(value) {
  if (!value) {
    return "This field can not be empty.";
  } else {
    return null;
  }
}

function formatMonth(i) {
  let month = i + 1;
  if (month < 10) {
    return "0" + String(month);
  } else {
    return String(month);
  }
}

export default defineConfig({
  branch,
  clientId,
  token,
  build: {
    outputFolder: "admin",
    publicFolder: "_site",
  },
  media: {
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  schema: {
    collections: [
      {
        name: "blog_post",
        label: "Blog Posts",
        path: "posts",
        format: "md",
        ui: {
          filename: {
            readOnly: false,
            slugify: (values) => {
              const date = values.date ? new Date(values.date) : null;
              return [
                date ? date.getFullYear() : null,
                date ? formatMonth(date.getMonth()) : null,
                values.title ? slugify(values.title) : "untitled",
              ]
                .filter(Boolean)
                .join("/");
            },
          },
        },
        fields: [
          {
            name: "title",
            label: "Title",
            type: "string",
            required: true,
            isTitle: true,
          },
          {
            name: "author",
            label: "Author",
            type: "string",
            options: authorData.authors,
            required: true,
          },
          {
            name: "date",
            label: "Date",
            type: "datetime",
            required: true,
            ui: {
              timeFormat: "HH:mm",
            },
          },
          {
            name: "hero_image",
            label: "Hero image",
            type: "object",
            description: "This will appear in the header of the post.",
            fields: [
              {
                name: "image",
                label: "Image",
                type: "image",
                required: false,
              },
              {
                name: "alt",
                label: "Alternate text",
                description:
                  "Use this text to describe the image for humans and robots who can’t see images.",
                type: "string",
                required: false,
              },
              {
                name: "caption",
                label: "Caption",
                description:
                  "This text will appear under the image. It shouldn’t be the same as the <em>alternate text</em>.",
                type: "string",
                required: false,
              },
            ],
          },
          {
            name: "excerpt",
            label: "Excerpt",
            type: "string",
            required: true,
            description: "This can appear as a preview summary of the post.",
            ui: {
              component: "textarea",
              validate: nonEmpty,
            },
          },
          {
            name: "external_link",
            label: "External link",
            type: "string",
            required: false,
            description:
              "The URL to the external page this post is about, if applicable.",
          },
          {
            name: "tags",
            type: "string",
            list: true,
            required: true,
            label: "Tags",
            description: "Tags are used to display posts related to this post.",
            ui: {
              defaultItem: () => "untagged",
            },
          },
          {
            name: "draft",
            label: "Draft",
            type: "boolean",
            required: true,
            description:
              "Turn this off to publish the post on the public site. Keep it on to preview the post.",
          },
          {
            name: "body",
            label: "Body",
            /* The Tina rich-text editor is broken. Use a plain-old string until
             * it's fixed.
             * https://github.com/tinacms/tinacms/issues/3118 */
            type: "string",
            isBody: true,
            ui: {
              component: "textarea",
              validate: nonEmpty,
            },
          },
        ],
      },
      {
        label: "About Page",
        name: "about_page",
        path: "about",
        format: "md",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            name: "title",
            label: "Title",
            type: "string",
            required: true,
            isTitle: true,
          },
          {
            name: "intro",
            label: "Intro",
            type: "string",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            name: "image_large",
            type: "object",
            fields: [
              {
                name: "image",
                label: "Image",
                type: "image",
              },
              {
                name: "alt",
                type: "string",
                required: false,
                label: "Alternate text",
                description:
                  "Use this text to describe the image for humans and robots who can’t see images.",
              },
              {
                name: "caption",
                type: "string",
                required: false,
                label: "Caption",
                description:
                  "This text will appear under the image. It shouldn’t be the same as the alternate text. (This isn't being used.)",
              },
            ],
            label: "Image",
            description: "An image to appear on the page.",
          },
          {
            name: "image_small",
            type: "object",
            fields: [
              {
                name: "image",
                label: "Image",
                type: "image",
              },
              {
                name: "alt",
                type: "string",
                required: false,
                label: "Alternate text",
                description:
                  "Use this text to describe the image for humans and robots who can’t see images.",
              },
              {
                name: "caption",
                type: "string",
                required: false,
                label: "Caption",
                description:
                  "This text will appear under the image. It shouldn’t be the same as the alternate text. (This isn't being used.)",
              },
            ],
            label: "Image (small)",
            description: "A small image to appear below posts.",
          },
          {
            name: "body",
            label: "Body",
            required: true,
            type: "rich-text",
            isBody: true,
          },
        ],
      },
      {
        name: "data",
        label: "Site data",
        path: "_data",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        templates: [
          {
            name: "ui_strings",
            label: "UI strings",
            fields: [
              {
                name: "open_linked",
                label: "Open Linked",
                type: "string",
                required: true,
                description: "Text to display on external linked pages.",
              },
              {
                name: "archive_link",
                type: "string",
                required: true,
                label: "Archive Link",
                description: "Text to display on the link to the archive.",
              },
              {
                name: "copyright",
                type: "string",
                required: true,
                label: "Footer",
                description: "Footer content.",
                ui: {
                  component: "textarea",
                },
              },
              {
                name: "contact_title",
                type: "string",
                required: true,
                label: "Contact title",
                description: "Title above the contact text.",
              },
              {
                name: "contact_text",
                type: "string",
                required: true,
                label: "Contact text",
                description: "Call-to-action for contact form.",
                ui: {
                  component: "textarea",
                },
              },
              {
                name: "email",
                type: "string",
                label: "Email",
                required: true,
              },
              {
                name: "subscribe_intro",
                type: "string",
                required: true,
                label: "Subscribe intro text",
                description: "This text introduces the subscription widget.",
                ui: {
                  component: "textarea",
                },
              },
              {
                name: "subscribe_feed_cta",
                label: "Subscribe call-to-action: feed",
                type: "string",
                required: true,
                ui: {
                  component: "textarea",
                },
              },
              {
                name: "subscribe_email_cta",
                label: "Subscribe call-to-action: email",
                type: "string",
                required: true,
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            name: "site_config",
            label: "Site config",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                required: true,
              },
              {
                type: "string",
                name: "site_url",
                label: "Site URL",
                required: true,
              },
              {
                name: "author_name",
                type: "string",
                required: false,
                label: "Author name",
                description: "The name of the site’s primary author.",
              },
              {
                name: "lang",
                type: "string",
                required: true,
                options: ["en-US"],
                label: "Language",
                description: "The site's language.",
              },
              {
                name: "timeZone",
                type: "string",
                required: true,
                options: Intl.supportedValuesOf("timeZone"),
                label: "Timezone",
                description: "The timezone used for dates.",
              },
              {
                name: "cloudinary_url",
                type: "string",
                required: true,
                label: "Cloudinary URL",
              },
              {
                name: "twitter_handle",
                type: "string",
                required: false,
                label: "Twitter handle, used for preview cards",
              },
            ],
          },
          {
            name: "authors",
            label: "Authors",
            fields: [
              {
                type: "string",
                name: "authors",
                label: "Authors",
                list: true,
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
});
