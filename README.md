# Cloudnet Webinterface

<p style="text-align:center;">
    <b>CloudNet is a modern application that can dynamically and easily deliver Minecraft oriented software.</b>
</p>

# Supported Versions

The current supported cloudnet versions. If your version is not supported, please upgrade to the newest one.

| Version | Supported          |
| ------- | ------------------ |
| RC-11   | :white_check_mark: |
| RC-10   | :x:                |

## My dashboard is empty

You forgot to give yourself permissions. Create a user by following these simple steps:

1. Install the "CloudNet-Rest" module using `modules install CloudNet-Rest` in your CloudNet console.
2. Create a new user with the `rest user create <username> <password>` command in your CloudNet console. (Example: `rest user create notch foobar`, will create user "notch" with password "foobar")
3. Assign the required permissions using `rest user <username> add scope global:admin` in your CloudNet console. (Example: `rest user notch add scope global:admin` will grant user "notch" admin permissions on your web interface)
4. If the webinterface is started, log in with the username and password you just created.

## Getting Started

Make sure you have pnpm installed using:

```bash
npm i -g pnpm
```

First, install the packages using:

```bash
pnpm install
```

To start the server, use the following command:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## .env

Want to host the website yourself?

Copy .env.example to .env and change `NEXT_PUBLIC_DOMAIN` to your own domain (including http or https).

## Pre-fill CloudNet address

So you want to fill in your user/pass without the address every single time?

Fill in `NEXT_PUBLIC_CLOUDNET_ADDRESS` in your .env file, like for example: `NEXT_PUBLIC_CLOUDNET_ADDRESS=127.0.0.1:2812`, this will autofill it for you.

If you want to use a domain: `NEXT_PUBLIC_CLOUDNET_ADDRESS=https://cloudnet.example.com`.

## Docker WebSocket Configuration

If you're running the web interface in Docker and experiencing issues with the console WebSocket connections, you may need to configure the WebSocket address separately:

1. **Expose CloudNet REST port to host**: Make sure port 2812 is accessible from the host machine where your browser runs
2. **Configure WebSocket address**: If the CloudNet server has a different address for WebSocket connections, set `NEXT_PUBLIC_WEBSOCKET_ADDRESS` in your .env file:
   ```
   NEXT_PUBLIC_WEBSOCKET_ADDRESS=192.168.1.100:2812
   ```
3. **Network troubleshooting**: The console connects via WebSocket from your browser directly to the CloudNet server. Ensure the address is reachable from your browser, not just from within the Docker network.

### Example Docker setup:
```bash
# If CloudNet runs on host 172.20.7.1:2812
# Make sure the port is accessible from your browser
ufw allow 2812
# Or allow from specific IP ranges
ufw allow from 192.168.0.0/16 to any port 2812
```

## Bugs may occur!

Meaning if you encounter any issues, please open up an issue. You are welcome to contribute to this project and create a PR.
