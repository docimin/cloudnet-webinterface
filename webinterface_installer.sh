#!/bin/bash

# Variables
REPO_URL="https://github.com/docimin/cloudnet-webinterface.git"
INSTALL_DIR="/opt/cloudnet-webinterface"
SERVICE_NAME="cloudnet-webinterface"

# Function to install a package
install_package() {
    local package=$1
    if ! command -v "$package" &> /dev/null; then
        echo "$package is not installed. Installing $package..."
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y "$package"
        elif command -v yum &> /dev/null; then
            sudo yum install -y "$package"
        elif command -v pacman &> /dev/null; then
            sudo pacman -Sy "$package"
        else
            echo "Package manager not detected. Please install $package manually."
            exit 1
        fi
    else
        echo "$package is already installed."
    fi
}

# Check and install dependencies
echo "Checking required dependencies..."
for dependency in git nodejs npm; do
    install_package "$dependency"
done

# Install pnpm if not already installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    sudo npm install -g pnpm
else
    echo "pnpm is already installed."
fi

# Clone or update the repository
echo "Cloning or updating the repository..."
if [ -d "$INSTALL_DIR" ]; then
    echo "The directory $INSTALL_DIR already exists. Updating repository..."
    cd "$INSTALL_DIR" || exit
    sudo git pull
else
    sudo git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR" || exit
fi

# Install project dependencies
echo "Installing project dependencies..."
sudo pnpm install

# Prompt the user for domain, port, and NEXT_PUBLIC_NAME
DEFAULT_IP=$(hostname -I | awk '{print $1}')
read -p "Enter the port for the web interface (default: 3000): " PORT
PORT=${PORT:-3000}

read -p "Enter the value for NEXT_PUBLIC_NAME (e.g., MyWebApp): " NAME
if [[ -z "$NAME" ]]; then
    echo "NEXT_PUBLIC_NAME cannot be empty."
    exit 1
fi

DOMAIN="http://$DEFAULT_IP:$PORT"

# Check and configure firewall
echo "Checking and configuring the firewall..."
if command -v ufw &> /dev/null; then
    echo "UFW detected. Allowing port $PORT..."
    sudo ufw allow "$PORT"
    sudo ufw reload
elif command -v firewall-cmd &> /dev/null; then
    echo "firewalld detected. Allowing port $PORT..."
    sudo firewall-cmd --add-port="$PORT"/tcp --permanent
    sudo firewall-cmd --reload
else
    echo "No supported firewall detected, or none is active. Skipping firewall configuration."
fi

# Copy example environment file and set values
if [ -f .env.example ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    sed -i "s|NEXT_PUBLIC_DOMAIN=.*|NEXT_PUBLIC_DOMAIN=$DOMAIN|g" .env
    sed -i "s|NEXT_PUBLIC_PORT=.*|NEXT_PUBLIC_PORT=$PORT|g" .env
    sed -i "s|NEXT_PUBLIC_NAME=.*|NEXT_PUBLIC_NAME=$NAME|g" .env
else
    echo "Error: .env.example not found. Please ensure the file exists."
    exit 1
fi

# Create a production build
echo "Creating a production build..."
if ! pnpm build; then
    echo "Error creating the production build. Please check the logs."
    exit 1
fi

# Create systemd service file
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
echo "Creating systemd service file for the production environment..."
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=CloudNet Web Interface
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$(command -v pnpm) start
Restart=always
User=$(whoami)
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_DOMAIN=$DOMAIN
Environment=NEXT_PUBLIC_PORT=$PORT
Environment=NEXT_PUBLIC_NAME=$NAME

[Install]
WantedBy=multi-user.target
EOL

# Set permissions and enable the service
echo "Setting permissions and enabling the service..."
sudo chmod 644 "$SERVICE_FILE"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

# Check if the service is running
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "The CloudNet Web Interface has been successfully set up and started."
    echo "It is accessible at $DOMAIN."
else
    echo "Error: The service could not be started. Please check the logs using 'sudo journalctl -u $SERVICE_NAME'."
    exit 1
fi
