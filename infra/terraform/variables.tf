variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "Deployment region (e.g., asia-northeast3)"
  type        = string
  default     = "asia-northeast3"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "s-class-pdf"
}

variable "image" {
  description = "Container image (e.g., asia-northeast3-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG)"
  type        = string
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated invoke to Cloud Run"
  type        = bool
  default     = false
}

variable "cpu" {
  description = "Container CPU (vCPU)"
  type        = number
  default     = 2
}

variable "memory" {
  description = "Container memory (e.g., 1Gi, 2Gi)"
  type        = string
  default     = "1Gi"
}

variable "concurrency" {
  description = "Max concurrent requests per instance"
  type        = number
  default     = 10
}

variable "timeout_seconds" {
  description = "Request timeout in seconds (Cloud Run max 3600)"
  type        = number
  default     = 300
}

variable "ingress" {
  description = "Ingress setting: INGRESS_TRAFFIC_ALL | INGRESS_TRAFFIC_INTERNAL_ONLY | INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  type        = string
  default     = "INGRESS_TRAFFIC_ALL"
}

variable "artifact_repo_location" {
  description = "Artifact Registry location"
  type        = string
  default     = "asia-northeast3"
}

variable "artifact_repo_name" {
  description = "Artifact Registry repository name"
  type        = string
  default     = "s-class-pdf-repo"
}


