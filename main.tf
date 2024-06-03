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


resource "aws_s3_bucket_policy" "nextjs_website_policy" {
  bucket = aws_s3_bucket.nextjs_website.id
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ashis-info-website/*"
    }
  ]
}
POLICY
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

resource "aws_s3_bucket_public_access_block" "nextjs_website" {
  bucket                  = aws_s3_bucket.nextjs_website.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
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
  value   = aws_s3_bucket_website_configuration.nextjs_website.website_endpoint
  type    = "CNAME"
  ttl     = 1
  proxied = true

  lifecycle {
    create_before_destroy = true
  }
}
