# Cloudnet Webinterface

<p style="text-align:center;">
    <b>CloudNet is a modern application that can dynamically and easily deliver Minecraft oriented software.</b>
</p>

## Getting Started

First, install the packages using:

```bash
npm install
```

To start the server, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Custom domain

Want to host the website on a custom domain?

Copy .env.example to .env and change `NEXT_PUBLIC_DOMAIN` to your own domain (including https).

## Pre-fill CloudNet address

So you want to fill in your user/pass without the address every single time?

Fill in `NEXT_PUBLIC_CLOUDNET_ADDRESS` in your .env file, like for example: `NEXT_PUBLIC_CLOUDNET_ADDRESS=127.0.0.1:2812`, this will auto-fill it for you.

If you want to use a domain: `NEXT_PUBLIC_CLOUDNET_ADDRESS=https://cloudnet.example.com`.

## Bugs may occur!

Meaning if you encounter any issues, please open up an issue. You are welcome to contribute to this project and create a PR.
