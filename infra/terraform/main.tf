resource "google_project_service" "enable_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
  ])
  service = each.key
}

# Artifact Registry (optional but recommended)
resource "google_artifact_registry_repository" "repo" {
  location      = var.artifact_repo_location
  repository_id = var.artifact_repo_name
  description   = "Container images for s-class-pdf"
  format        = "DOCKER"

  depends_on = [google_project_service.enable_apis]
}

# Cloud Run 서비스 계정
resource "google_service_account" "run_sa" {
  account_id   = "${var.service_name}-sa"
  display_name = "Cloud Run service account for ${var.service_name}"
}

resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  deletion_protection = false

  ingress = var.ingress

  template {
    service_account = google_service_account.run_sa.email
    max_instance_request_concurrency = var.concurrency
    timeout = "${var.timeout_seconds}s"

    containers {
      image = var.image

      startup_probe {
        tcp_socket { port = 8080 }
        failure_threshold     = 6
        period_seconds        = 30
        timeout_seconds       = 30
        initial_delay_seconds = 0
      }

      resources {
        cpu_idle = false
        limits = {
          cpu    = tostring(var.cpu)
          memory = var.memory
        }
      }

      # Cloud Run gRPC: container 포트는 h2c 이름으로 8080 오픈
      ports {
        name         = "h2c"
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }

  depends_on = [
    google_project_service.enable_apis,
  ]
}

# 공개 접근 허용시 IAM 바인딩
resource "google_cloud_run_v2_service_iam_member" "invoker_all" {
  count    = var.allow_unauthenticated ? 1 : 0
  project  = google_cloud_run_v2_service.service.project
  location = google_cloud_run_v2_service.service.location
  name     = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}


