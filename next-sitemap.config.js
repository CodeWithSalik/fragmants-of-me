/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://fragmants-of-me.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin', '/admin/*', '/private', '/api/*', '/write', '/404'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/private', '/api', '/_next', '/write', '/404'],
      },
    ],
    additionalSitemaps: ['https://fragmants-of-me.vercel.app/sitemap.xml'],
  },
};
