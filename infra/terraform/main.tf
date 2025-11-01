locals {
  resource_suffix = var.resource_suffix != "" ? "-${var.resource_suffix}" : ""
  vpc_network_name = var.use_existing_vpc ? var.existing_vpc_name : (var.enable_vpc && !var.use_existing_vpc ? google_compute_network.main[0].name : "")
  subnet_cidr = var.use_existing_vpc && var.enable_vpc ? data.google_compute_subnetwork.existing[0].ip_cidr_range : var.subnet_cidr
}

resource "google_project_service" "enable_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "vpcaccess.googleapis.com",
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
  deletion_protection = var.deletion_protection

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
        timeout_seconds       = 5
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
      # PORT는 Cloud Run이 자동으로 설정하므로 제거
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

# 기존 VPC 네트워크 조회 (use_existing_vpc가 true일 때)
data "google_compute_network" "existing" {
  count = var.enable_vpc && var.use_existing_vpc ? 1 : 0
  name  = var.existing_vpc_name
}

# 기존 서브넷 조회 (use_existing_vpc가 true일 때)
data "google_compute_subnetwork" "existing" {
  count = var.enable_vpc && var.use_existing_vpc ? 1 : 0
  name  = var.existing_subnet_name
  region = var.region
}

# VPC 네트워크 리소스 (새로 생성할 때)
resource "google_compute_network" "main" {
  count = var.enable_vpc && !var.use_existing_vpc ? 1 : 0
  
  name                    = "${var.app_name}-network${local.resource_suffix}"
  auto_create_subnetworks = false
  description             = "VPC 네트워크 for ${var.app_name} ${var.environment}"

  depends_on = [google_project_service.enable_apis]
}

# 서브넷 리소스 (새로 생성할 때)
resource "google_compute_subnetwork" "main" {
  count = var.enable_vpc && !var.use_existing_vpc ? 1 : 0
  
  name          = "${var.app_name}-subnet${local.resource_suffix}"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.main[0].id
  description   = "서브넷 for ${var.app_name} ${var.environment}"

  depends_on = [google_compute_network.main]
}


# 각 VPC 네트워크에 대한 데이터 조회 (CodeRunner 배포용)
data "google_compute_network" "coderunner_vpcs" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  name     = each.value.vpc_name
}

data "google_compute_subnetwork" "coderunner_subnets" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  name     = each.value.subnet_name
  region   = var.region
}

# Serverless VPC Access Connector (각 네트워크마다)
resource "google_vpc_access_connector" "coderunner" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  
  name          = "pdf-vpc-conn-${each.value.suffix}${local.resource_suffix}"  # VPC Connector 이름은 최대 25자, 소문자/하이픈/숫자만
  region        = var.region
  network       = each.value.vpc_name
  ip_cidr_range = each.value.suffix == "prod" ? "10.8.0.0/28" : "10.9.0.0/28"  # 각 네트워크마다 다른 CIDR (서브넷과 겹치지 않도록)
  
  min_instances = 2
  max_instances = 3

  depends_on = [
    google_project_service.enable_apis,
  ]
}

# 기존 VPC 사용 시를 위한 Connector (하위 호환성)
resource "google_vpc_access_connector" "connector" {
  count = var.enable_vpc && var.use_existing_vpc && length(var.coderunner_vpc_networks) == 0 ? 1 : 0
  
  name          = "${var.app_name}-vpc-connector${local.resource_suffix}"
  region        = var.region
  network       = local.vpc_network_name
  ip_cidr_range = "10.8.0.0/28"
  
  min_instances = 2
  max_instances = 3

  depends_on = [
    google_project_service.enable_apis,
  ]
}

# 방화벽 규칙: VPC 내부 통신 허용
resource "google_compute_firewall" "allow_internal" {
  count = var.enable_vpc ? 1 : 0
  
  name    = "${var.app_name}-allow-internal${local.resource_suffix}"
  network = local.vpc_network_name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [local.subnet_cidr]
  
  description = "Allow all internal traffic within VPC"
}

# 방화벽 규칙: 허용된 프로젝트에서 CodeRunner 접근 허용 (VPC Peering 사용 시)
resource "google_compute_firewall" "allow_coderunner_from_projects" {
  count = var.enable_vpc && length(var.allowed_source_projects) > 0 ? 1 : 0
  
  name    = "${var.app_name}-allow-coderunner${local.resource_suffix}"
  network = local.vpc_network_name

  allow {
    protocol = "tcp"
    ports    = ["8080", "443"]
  }

  # 허용된 프로젝트들의 기본 서브넷 범위 또는 특정 CIDR 범위
  source_ranges = length(var.allowed_source_ranges) > 0 ? var.allowed_source_ranges : []
  
  target_tags = ["coderunner-server"]
  
  description = "Allow CodeRunner access from s-class-platform and s-class-platform-dev projects"
}

# CodeRunner Cloud Run 서비스 계정 (각 네트워크마다)
resource "google_service_account" "coderunner_sa" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  
  account_id   = "coderunner-sa-${each.value.suffix}${local.resource_suffix}"
  display_name = "Cloud Run service account for CodeRunner ${each.value.suffix}"
}

# CodeRunner Cloud Run 서비스 (각 네트워크마다)
resource "google_cloud_run_v2_service" "coderunner" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  
  name              = "coderunner-${each.value.suffix}${local.resource_suffix}"
  location          = var.region
  deletion_protection = var.deletion_protection

  # 내부 트래픽만 허용 (VPC 내부에서만 접근 가능)
  ingress = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account = google_service_account.coderunner_sa[each.key].email
    max_instance_request_concurrency = var.concurrency
    timeout = "${var.timeout_seconds}s"

    # VPC Connector 연결
    vpc_access {
      connector = google_vpc_access_connector.coderunner[each.key].id
      egress    = "PRIVATE_RANGES_ONLY"  # VPC 내부로만 트래픽 라우팅
    }

    containers {
      image = var.coderunner_image != "" ? var.coderunner_image : var.image

      startup_probe {
        tcp_socket { port = 8080 }
        failure_threshold     = 10  # 더 많은 시도 허용
        period_seconds        = 10  # 더 자주 체크
        timeout_seconds       = 5
        initial_delay_seconds = 10  # 초기 지연 추가 (컨테이너 시작 시간 확보)
      }

      resources {
        cpu_idle = false
        limits = {
          cpu    = tostring(var.cpu)
          memory = var.memory
        }
      }

      ports {
        name          = "h2c"
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      # PORT는 Cloud Run이 자동으로 설정하므로 제거
    }
  }

  depends_on = [
    google_project_service.enable_apis,
    google_vpc_access_connector.coderunner,
  ]
}

# 각 네트워크의 방화벽 규칙 (VPC 내부 통신 허용)
resource "google_compute_firewall" "coderunner_internal" {
  for_each = { for v in var.coderunner_vpc_networks : v.suffix => v }
  
  name    = "${var.app_name}-allow-internal-${each.value.suffix}${local.resource_suffix}"
  network = each.value.vpc_name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [data.google_compute_subnetwork.coderunner_subnets[each.key].ip_cidr_range]
  
  description = "Allow all internal traffic within ${each.value.vpc_name}"
}

# 허용된 프로젝트의 서비스 계정에 CodeRunner 접근 권한 부여
# 주의: 다른 프로젝트의 서비스 계정은 직접 참조할 수 없으므로 수동 설정 필요
# manage_iam_policies가 false이면 Terraform에서 관리하지 않음
resource "google_cloud_run_v2_service_iam_member" "coderunner_invoker" {
  for_each = var.manage_iam_policies ? {
    for combo in flatten([
      for v in var.coderunner_vpc_networks : [
        for project in var.allowed_source_projects : {
          key = "${v.suffix}-${project}"
          suffix = v.suffix
          project = project
        }
      ]
    ]) : combo.key => combo
  } : {}
  
  project  = google_cloud_run_v2_service.coderunner[each.value.suffix].project
  location = google_cloud_run_v2_service.coderunner[each.value.suffix].location
  name     = google_cloud_run_v2_service.coderunner[each.value.suffix].name
  role     = "roles/run.invoker"
  # 각 프로젝트의 기본 Compute Engine 서비스 계정 (다른 프로젝트의 서비스 계정은 직접 참조 불가)
  member   = "serviceAccount:${each.value.project}@appspot.gserviceaccount.com"
}

# 하위 호환성을 위한 기존 CodeRunner 리소스 (단일 네트워크 사용 시)
resource "google_service_account" "coderunner_sa_legacy" {
  count = var.enable_vpc && var.use_existing_vpc && length(var.coderunner_vpc_networks) == 0 ? 1 : 0
  
  account_id   = "coderunner-sa${local.resource_suffix}"
  display_name = "Cloud Run service account for CodeRunner"
}

resource "google_cloud_run_v2_service" "coderunner_legacy" {
  count = var.enable_vpc && var.use_existing_vpc && length(var.coderunner_vpc_networks) == 0 ? 1 : 0
  
  name              = "coderunner${local.resource_suffix}"
  location          = var.region
  deletion_protection = var.deletion_protection

  ingress = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account = google_service_account.coderunner_sa_legacy[0].email
    max_instance_request_concurrency = var.concurrency
    timeout = "${var.timeout_seconds}s"

    vpc_access {
      connector = google_vpc_access_connector.connector[0].id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = var.coderunner_image != "" ? var.coderunner_image : var.image

      startup_probe {
        tcp_socket { port = 8080 }
        failure_threshold     = 10  # 더 많은 시도 허용
        period_seconds        = 10  # 더 자주 체크
        timeout_seconds       = 5
        initial_delay_seconds = 10  # 초기 지연 추가 (컨테이너 시작 시간 확보)
      }

      resources {
        cpu_idle = false
        limits = {
          cpu    = tostring(var.cpu)
          memory = var.memory
        }
      }

      ports {
        name          = "h2c"
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      # PORT는 Cloud Run이 자동으로 설정하므로 제거
    }
  }

  depends_on = [
    google_project_service.enable_apis,
    google_vpc_access_connector.connector,
  ]
}


