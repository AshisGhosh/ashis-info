#!/bin/bash

# Generate a unique bucket name using account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="my-terraform-state-bucket-$ACCOUNT_ID"
REGION="us-west-2"

# Function to print messages
print_message() {
    echo -e "\n===== $1 =====\n"
}

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Install OpenTofu
if command_exists tofu; then
    print_message "OpenTofu is already installed."
    tofu version
else
    print_message "Installing OpenTofu"
    # Download the installer script
    print_message "Downloading OpenTofu installer script"
    curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh
    if [ $? -ne 0 ]; then
        echo "Failed to download the installer script. Please check your internet connection."
        exit 1
    fi

    # Give it execution permissions
    print_message "Giving execution permissions to the installer script"
    chmod +x install-opentofu.sh

    # Inspect the downloaded script (optional, just a placeholder for now)
    print_message "Inspecting the downloaded script (optional step)"

    # Run the installer
    print_message "Running the OpenTofu installer"
    ./install-opentofu.sh --install-method deb
    if [ $? -ne 0 ]; then
        echo "OpenTofu installation failed. Please check the installer script for errors."
        exit 1
    fi

    # Remove the installer
    print_message "Cleaning up the installer script"
    rm install-opentofu.sh

    # Verify installation
    if command_exists tofu; then
        print_message "OpenTofu installation was successful."
        tofu version
    else
        echo "OpenTofu installation failed. Please check the installer script for errors."
        exit 1
    fi
fi

# Install AWS CLI
if command_exists aws; then
    print_message "AWS CLI is already installed."
    aws --version
else
    print_message "Installing AWS CLI"
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    if [ $? -ne 0 ]; then
        echo "Failed to download the AWS CLI installer. Please check your internet connection."
        exit 1
    fi

    unzip awscliv2.zip
    sudo ./aws/install
    if [ $? -ne 0 ]; then
        echo "AWS CLI installation failed. Please check the installer script for errors."
        exit 1
    fi

    rm -rf awscliv2.zip aws

    # Verify installation
    if command_exists aws; then
        print_message "AWS CLI installation was successful."
        aws --version
    else
        echo "AWS CLI installation failed. Please check the installer script for errors."
        exit 1
    fi
fi

# Check if the bucket exists
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    print_message "Creating S3 bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
    if [ $? -ne 0 ]; then
        echo "Failed to create the S3 bucket. Please check your AWS credentials and permissions."
        exit 1
    fi
else
    print_message "S3 bucket $BUCKET_NAME already exists."
fi

# Initialize OpenTofu with S3 backend
if [ ! -f "main.tf" ]; then
    print message "Something is wrong - no main.tf"
    exit 1
else
    print_message "main.tf exists"
fi

# Create variables.tf if not exists
if [ ! -f "variables.tf" ]; then
    print_message "Creating variables.tf"
    cat > variables.tf <<EOF
variable "cloudflare_api_token" {
  description = "API Token for Cloudflare"
  type        = string
  validation {
    condition     = length(var.cloudflare_api_token) == 40 && can(regex("[a-zA-Z0-9-_]+", var.cloudflare_api_token))
    error_message = "API tokens must be 40 characters long and only contain characters a-z, A-Z, 0-9, hyphens, and underscores."
  }
}

variable "cloudflare_zone_id" {
  description = "Zone ID for the Cloudflare domain"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the website"
  type        = string
}
EOF
    print_message "variables.tf created successfully"
else
    print_message "variables.tf already exists, skipping creation"
fi

# Create terraform.tfvars if not exists
if [ ! -f "terraform.tfvars" ]; then
    print_message "Creating terraform.tfvars"
    cat > terraform.tfvars <<EOF
cloudflare_api_token = "your-cloudflare-api-token"
cloudflare_zone_id   = "your-cloudflare-zone-id"
domain_name          = "your-domain-name"
EOF
    print_message "terraform.tfvars created successfully"
else
    print_message "terraform.tfvars already exists, skipping creation"
fi

print_message "Initializing OpenTofu"
tofu init
if [ $? -ne 0 ]; then
    echo "OpenTofu initialization failed. Please check the configuration."
    exit 1
fi

print_message "OpenTofu initialization successful."
