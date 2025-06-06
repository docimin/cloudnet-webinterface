#!/bin/sh

set -e

# This is built here and not in the Dockerfile, because some environment variables (like NEXT_PUBLIC_CLOUDNET_ADDRESS_HIDDEN=true) are required to be set during build process.
echo Building...
pnpm build

echo Starting...
pnpm start
