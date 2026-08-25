/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: "https://fragmants-of-me.vercel.app",

  generateRobotsTxt: true,

  generateIndexSitemap: false,

  exclude: [
    "/admin",
    "/admin/*",
    "/private",
    "/api/*",
    "/write",
    "/404",
    "/login",
    "/register",
    "/forgot-password",
    "/profile",
    "/notifications",
    "/saved",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/private",
          "/api",
          "/_next",
          "/write",
          "/404",
          "/login",
          "/register",
          "/forgot-password",
          "/profile",
          "/notifications",
          "/saved",
        ],
      },
    ],

    additionalSitemaps: [],
  },
};