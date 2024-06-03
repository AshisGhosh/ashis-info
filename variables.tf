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
