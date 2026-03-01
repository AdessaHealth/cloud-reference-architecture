/**
 * # Project: Healthcare Platform Foundation
 * # Description: Secure, HIPAA-compliant GCP Landing Zone
 * # Author: Ahsan Uddin
 */

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "tf-state-storage-bucket"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# --- LOGGING LAYER ---
# Centralized Audit Sink for Compliance
resource "google_logging_project_sink" "audit_logs" {
  name                   = "centralized-audit-sink"
  description            = "Sinks all non-standard audit logs to a dedicated storage bucket for compliance."
  destination            = "logging.googleapis.com/projects/${var.gcp_project_id}/locations/global/buckets/audit-logs-bucket"
  
  filter                 = <<EOT
    NOT LOG_ID("cloudaudit.googleapis.com/activity") 
    AND NOT LOG_ID("externalaudit.googleapis.com/activity")
    AND severity >= WARNING
  EOT

  project                = var.gcp_project_id
  unique_writer_identity = true
}

# --- SECURITY LAYER ---
# Secret Manager for External API Tokens
resource "google_secret_manager_secret" "api_oauth_token" {
  secret_id = "external-api-oauth-token"
  
  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }

  replication {
    auto {}
  }
}

# --- COMPUTE LAYER ---
# Serverless Cloud Run Service (Hardened)
resource "google_cloud_run_v2_service" "api" {
  name     = "healthcare-api"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.gcp_project_id}/healthcare-api:latest"
      
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "DB_HOST"
        value = google_sql_database_instance.main.private_ip_address
      }
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
}

# --- DATA LAYER ---
# Managed Cloud SQL (PostgreSQL)
resource "google_sql_database_instance" "main" {
  name             = "healthcare-db-instance"
  region           = var.gcp_region
  database_version = "POSTGRES_15"
  
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
    }
  }
}
