/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // FIX: Changed 'fragments' to 'fragmants'
  siteUrl: 'https://fragmants-of-me.vercel.app', 
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/private', '/api/*', '/write', '/404'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/private', '/api', '/_next', '/write', '/404'],
      },
    ],
  },
}