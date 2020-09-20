const path = require("path");
const process = require("process");
const {
  createPages,
  onCreatePage
} = require("./lib/js/src/GatsbyNode_CreatePages.bs.js");

module.exports = {
  createPages,
  onCreatePage,
  createSchemaCustomization: ({actions: {createTypes}}) => {
    createTypes(`
      type Post implements Node @dontinfer {
        title: String!
        date: Date! @dateformat
        author: String!
        heroImage: HeroImage
        slug: String!
        year: Int!
        month: Int!
        externalLink: String
        """
        If \`true\` then the post will appear in the production build.
        """
        draft: Boolean!
        """
        If \`false\`, the post will not appear in the production build. In
        developement, this is always \`true\`. In production, it is always the
        opposite of \`frontmatter.draft\`.
        """
        published: Boolean!
        tags: [String!]!
        """
        A list of posts with any of the same tags.
        """
        related(limit: Int): [Post!]!
      }

      type HeroImage @dontinfer {
        image: File @fileByRelativePath
        alt: String
        caption: String
      }

      type Site implements Node @dontinfer {
        siteMetadata: SiteMetadata!
      }

      type SiteMetadata @dontinfer {
        title: String!
        description: String!
        archivePerPage: Int!
        siteUrl: String!
        feedUrl: String!
        twitterHandle: String
      }

      type DataYaml implements Node {
        page: YamlPageId
      }

      enum YamlPageId {
        ABOUT
        AUTHORS
        STRINGS
      }
    `);
  },
  createResolvers: ({createResolvers}) =>
    createResolvers({
      Post: {
        related: {
          // https://www.gatsbyjs.com/docs/node-model/#runQuery
          // I have no knowledge of this function's performance. It may be
          // worthwhile to test it once my data grows larger.
          // E.g.: Due to how Gatsby caches query results, it may be more
          // performant to filter the result rather than in the query.
          resolve: (source, args, context, _info) =>
            context.nodeModel.runQuery(
              {
                type: "Post",
                firstOnly: false,
                query: {
                  sort: {
                    fields: ["date"],
                    order: ["DESC"],
                  },
                  filter: {
                    tags: {in: source.tags},
                    id: {ne: source.id},
                    published: {eq: true},
                  },
                },
              },
            ).then(
              result => {
                if (!result) {
                  return [];
                } else if (args.limit) {
                  return result.slice(0, args.limit);
                } else {
                  return result;
                }
              }
            )
        },
      },
    }),
  onCreateNode: ({
    node,
    actions: {createNode, createParentChildLink},
    getNode,
    createNodeId,
    createContentDigest,
  }) => {
    if (
      node.internal.type === "MarkdownRemark"
      && getNode(node.parent).sourceInstanceName === "posts"
    ) {
      const date = new Date(node.frontmatter.date);
      const obj = {
        title: node.frontmatter.title,
        date: node.frontmatter.date,
        author: node.frontmatter.author,
        heroImage: node.frontmatter.hero_image,
        draft: node.frontmatter.draft,
        externalLink: node.frontmatter.external_link,
        tags: node.frontmatter.tags || [],
        slug: 
          node.frontmatter.slug !== undefined && node.frontmatter.slug !== ""
            ? node.frontmatter.slug
            : path.basename(node.fileAbsolutePath, ".md"),
        published:
          process.env.NODE_ENV === "development" 
            ? true 
            : !node.frontmatter.draft,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
      const postNode = {
        ...obj,
        id: createNodeId(node.id + " >>> Post"),
        children: [],
        parent: node.id,
        internal: {
          contentDigest: createContentDigest(obj),
          type: "Post",
        },
      };
      createNode(postNode);
      createParentChildLink({ parent: node, child: postNode });
    }
  },
};
