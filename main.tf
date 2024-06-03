provider "aws" {
  region = "us-west-2"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

terraform {
  backend "s3" {
    bucket = "my-terraform-state-bucket-851725260644"
    key    = "terraform/state"
    region = "us-west-2"
  }
}

resource "aws_s3_bucket" "nextjs_website" {
  bucket = "ashis-info-website"
}

resource "aws_s3_bucket_acl" "nextjs_website_acl" {
  bucket = aws_s3_bucket.nextjs_website.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "nextjs_website" {
  bucket = aws_s3_bucket.nextjs_website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_object" "website_files" {
  for_each = fileset("out", "**/*")

  bucket = aws_s3_bucket.nextjs_website.id
  key    = each.value
  source = "out/${each.value}"
  acl    = "public-read"
}

resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = aws_s3_bucket.nextjs_website.website_endpoint
  type    = "CNAME"
  ttl     = 3600
  proxied = true

  lifecycle {
    prevent_destroy = true
  }
}
