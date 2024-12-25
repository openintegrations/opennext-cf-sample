/**
 * Meta: change from `@type` to @satisfies once ts 5.0 is out
 * @type {import('next').NextConfig}
 */
const nextConfig = {

  typescript: {ignoreBuildErrors: true},
  eslint: {ignoreDuringBuilds: true},
}

module.exports = nextConfig
