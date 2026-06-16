#if running on EC2
change line 3 in frontend/src/App.
chage to
      const API = 'http:your-public-ip:8000';
      
      
# 🟢 Uptime Monitor

A lightweight full-stack URL uptime monitoring application that periodically pings registered URLs and displays their health status, response time, and history in real time.

---

## 🚀 1-Line Setup

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🏗 Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐
│   React Frontend    │◄──────►│   FastAPI Backend         │
│   (Port 3000)       │  HTTP  │   (Port 8000)             │
└─────────────────────┘        │   + APScheduler (60s ping)│
                                │   + SQLite (persistent)   │
                                └──────────────────────────┘
```

- **Backend:** Python + FastAPI + APScheduler (pings every 60 seconds) + SQLite
- **Frontend:** React 18 + Axios (auto-refreshes every 15 seconds)
- **Storage:** SQLite (persisted via Docker volume)
- **Orchestration:** Docker Compose

---

## 🧪 Testing Steps (Up & Down States)

### Step 1: Start the application
```bash
docker compose up --build
```

### Step 2: Open the dashboard
Visit http://localhost:3000

### Step 3: Add a healthy URL (should show UP)
In the input box, enter:
```
https://example.com
```
Click **+ Add** — it pings immediately and shows **UP** with response time.

### Step 4: Add a broken URL (should show DOWN)
In the input box, enter:
```
https://this-url-does-not-exist-xyz123.com
```
Click **+ Add** — it immediately shows **DOWN** with no response time (timeout/DNS failure).

### Step 5: Verify via API directly (optional)
```bash
# List all monitored URLs with latest status
curl http://localhost:8000/urls

# View check history for URL with id=1
curl http://localhost:8000/urls/1/history
```

### Step 6: Wait 60 seconds
The scheduler pings all URLs every 60 seconds. The dashboard auto-refreshes every 15 seconds. You'll see timestamps update automatically.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/urls` | Register a new URL |
| `GET` | `/urls` | List all URLs with latest check |
| `DELETE` | `/urls/{id}` | Remove a URL |
| `GET` | `/urls/{id}/history` | Get check history (last 20) |
| `GET` | `/health` | Backend health check |


--frontend -
<img width="1338" height="680" alt="uptime moniter" src="https://github.com/user-attachments/assets/8ff244b0-ee9a-409c-a881-eab0e5f36b99" />
--backend -
<img width="1333" height="678" alt="uptime database" src="https://github.com/user-attachments/assets/efb04b40-4abb-4530-8ecd-b864e8f5dfe4" />



## ☁️ Deployment Sketch (AWS)

For a production deployment on AWS, here is a minimal Terraform sketch:

```hcl
# main.tf — Hypothetical AWS ECS Fargate Deployment

provider "aws" {
  region = "us-east-1"
}

# VPC & Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "uptime-monitor-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "uptime-monitor"
}

# Backend Task (FastAPI)
resource "aws_ecs_task_definition" "backend" {
  family                   = "uptime-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([{
    name  = "backend"
    image = "<ECR_REPO_URL>/uptime-backend:latest"
    portMappings = [{ containerPort = 8000 }]
    environment = [{ name = "ENV", value = "production" }]
  }])
}

# Frontend served via S3 + CloudFront (static React build)
resource "aws_s3_bucket" "frontend" {
  bucket = "uptime-monitor-frontend"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Application Load Balancer for backend
resource "aws_lb" "backend" {
  name               = "uptime-backend-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = module.vpc.public_subnets
}
```

### Cloud Architecture Summary:
- **Frontend:** React build → S3 bucket → CloudFront CDN (HTTPS, global edge)
- **Backend:** Docker image → ECR → ECS Fargate (serverless containers, auto-scaling)
- **Database:** Upgrade SQLite → Amazon RDS (PostgreSQL) for persistence and scale
- **Load Balancer:** ALB in front of ECS for health checks and routing
- **Networking:** VPC with public/private subnets, NAT Gateway for outbound pings

---

## 🤖 AI Collaboration Log

See [AI_LOG.md](./AI_LOG.md) for full details of AI tool usage.
