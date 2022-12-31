import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "master";

const clientId = process.env.TINA_CLIENT_ID || "";
const token = process.env.TINA_TOKEN || "";

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
        name: "blog_posts",
        label: "Blog Posts",
        path: "posts",
        format: "md",
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
            options: ["John Jackson"],
            description: "Enter the author of the post",
            required: true,
          },
          {
            name: "date",
            label: "Date",
            type: "datetime",
            required: true,
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
                type: "string",
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
            name: "draft",
            label: "Draft",
            type: "boolean",
            description:
              "Turn this off to publish the post on the public site. Keep it on to preview the post.",
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
      {
        label: "About Page",
        name: "about_page",
        path: "about",
        format: "md",
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
            type: "rich-text",
            required: true,
            description: "Enter description here",
          },
          {
            name: "image_large",
            type: "object",
            fields: [
              {
                name: "image",
                type: "string",
                label: "Image",
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
                  "This text will appear under the image. It shouldn’t be the same as the <em>alternate text</em>. (This isn't being used.)",
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
                type: "string",
                label: "Image",
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
                  "This text will appear under the image. It shouldn’t be the same as the <em>alternate text</em>. (This isn't being used.)",
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
    ],
  },
});
