# This is a WIP project, it's not production ready!

This is a [Next.js](https://nextjs.org/) project using Tailwind CSS.

## Getting Started

First, edit the .env file to include your URL.

Make sure to rename `.env.example` to `.env` !

If your CloudNet API is running on http, you can use the following URL:

```bash
NEXT_PUBLIC_DEV_PROXY_URL=http://localhost:2812
```

if you are running the CloudNet API on a different server with reverse proxy (https) and you get cors issues, you can use the following URL:

```bash
NEXT_PUBLIC_DEV_PROXY_URL=https://cors.fayevr.dev/your-cloudnet-api-url.com
```

To start the server, use the following command:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## It is with extreme importance to know that this is a WIP project.
You are however welcome to contribute to this project.
