/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Habilita el plugin de styled-components en SWC
    styledComponents: true
  }
};

module.exports = nextConfig;
