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

variable "app_name" {
  description = "Application name for resource naming"
  type        = string
  default     = "s-class-pdf"
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
  default     = "prod"
}

variable "resource_suffix" {
  description = "Suffix for resource names"
  type        = string
  default     = ""
}

variable "subnet_cidr" {
  description = "CIDR range for the subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_source_projects" {
  description = "List of project IDs allowed to access CodeRunner (for VPC peering or shared VPC)"
  type        = list(string)
  default     = ["s-class-platform", "s-class-platform-dev"]
}

variable "manage_iam_policies" {
  description = "Whether to manage IAM policies via Terraform (false for manual management)"
  type        = bool
  default     = false
}

variable "allowed_source_ranges" {
  description = "List of CIDR ranges allowed to access CodeRunner"
  type        = list(string)
  default     = []
}

variable "enable_vpc" {
  description = "Enable VPC networking for CodeRunner"
  type        = bool
  default     = true
}

variable "use_existing_vpc" {
  description = "Use existing VPC network instead of creating new one"
  type        = bool
  default     = false
}

variable "existing_vpc_name" {
  description = "Name of existing VPC network to use"
  type        = string
  default     = ""
}

variable "existing_subnet_name" {
  description = "Name of existing subnet to use"
  type        = string
  default     = ""
}

variable "coderunner_vpc_networks" {
  description = "List of VPC networks to deploy CodeRunner to"
  type = list(object({
    vpc_name    = string
    subnet_name = string
    suffix      = string  # 리소스 이름에 사용할 접미사 (예: "prod", "dev")
  }))
  default = []
}

variable "coderunner_image" {
  description = "CodeRunner container image URL"
  type        = string
  default     = ""
}

variable "deletion_protection" {
  description = "If true, prevents the Cloud Run service from being accidentally deleted."
  type        = bool
  default     = false
}


