/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Временно отключаем ESLint на прод-билде (на Vercel),
  // чтобы не блокировать деплой из-за внешнего rushstack-patch.
  // Локально продолжайте использовать `npm run lint`.
  eslint: {
    // Важно: это позволяет сборке завершаться даже при ESLint-ошибках.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
