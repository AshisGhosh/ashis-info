provider "aws" {
  alias  = "us-west-2"
  region = "us-west-2"
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
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

resource "aws_acm_certificate" "cert" {
  provider = aws.us-east-1
  domain_name       = "ashis.info"
  validation_method = "DNS"

  subject_alternative_names = ["www.ashis.info"]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "ashis.info-cert"
  }
}

resource "cloudflare_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  value   = each.value.value
}

resource "aws_acm_certificate_validation" "cert" {
  provider               = aws.us-east-1
  certificate_arn        = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in cloudflare_record.cert_validation : record.hostname]
}

resource "aws_s3_bucket" "nextjs_website" {
  provider = aws.us-west-2
  bucket = "ashis-info-website"
}


resource "aws_s3_bucket_policy" "nextjs_website_policy" {
  provider = aws.us-west-2
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
  provider = aws.us-west-2
  bucket = aws_s3_bucket.nextjs_website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "nextjs_website" {
  provider = aws.us-west-2
  bucket                  = aws_s3_bucket.nextjs_website.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  provider = aws.us-west-2
  comment = "Access to S3 bucket"
}

resource "aws_cloudfront_distribution" "cdn" {
  provider = aws.us-west-2
  origin {
    domain_name = aws_s3_bucket.nextjs_website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.nextjs_website.id
  
    s3_origin_config {
        origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Next.js website distribution"
  default_root_object = "index.html"

  aliases = ["ashis.info", "www.ashis.info"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.nextjs_website.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "ashis.info"
  value   = aws_cloudfront_distribution.cdn.domain_name
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = aws_cloudfront_distribution.cdn.domain_name
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
