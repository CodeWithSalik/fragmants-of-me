/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://fragments-of-me.vercel.app', // Update this after deployment
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/private', '/write'], // Hide admin/private pages from Google
}