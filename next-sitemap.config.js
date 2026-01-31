/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://fragments-of-me.vercel.app', // Your production domain
  generateRobotsTxt: true, // Auto-generate the robots.txt file
  
  // 1. Hide these pages from the sitemap list itself
  exclude: [
    '/admin', 
    '/admin/*', 
    '/private', 
    '/api/*', 
    '/write', 
    '/404'
  ], 

  // 2. Define specific rules for the robots.txt file
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/private',
          '/api',
          '/_next',
          '/write',
          '/404'
        ],
      },
    ],
  },
}