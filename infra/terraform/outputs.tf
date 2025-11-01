output "cloud_run_uri" {
  description = "Deployed Cloud Run URL"
  value       = google_cloud_run_v2_service.service.uri
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository path"
  value       = google_artifact_registry_repository.repo.id
}

output "vpc_network_name" {
  description = "VPC network name"
  value       = var.enable_vpc ? local.vpc_network_name : null
}

output "vpc_network_id" {
  description = "VPC network ID"
  value       = var.enable_vpc ? (var.use_existing_vpc ? data.google_compute_network.existing[0].id : google_compute_network.main[0].id) : null
}

output "subnet_name" {
  description = "Subnet name"
  value       = var.enable_vpc ? (var.use_existing_vpc ? var.existing_subnet_name : google_compute_subnetwork.main[0].name) : null
}

output "vpc_connector_name" {
  description = "VPC Access Connector name (legacy)"
  value       = var.enable_vpc && length(var.coderunner_vpc_networks) == 0 ? google_vpc_access_connector.connector[0].name : null
}

output "coderunner_vpc_connectors" {
  description = "VPC Access Connector names for each network"
  value = {
    for suffix, connector in google_vpc_access_connector.coderunner : suffix => connector.name
  }
}

output "coderunner_services" {
  description = "CodeRunner Cloud Run service information for each network"
  value = {
    for suffix, service in google_cloud_run_v2_service.coderunner : suffix => {
      name = service.name
      uri  = service.uri
    }
  }
}

output "coderunner_service_uri" {
  description = "CodeRunner Cloud Run service URL (legacy, first network only)"
  value       = length(var.coderunner_vpc_networks) > 0 ? google_cloud_run_v2_service.coderunner[keys(google_cloud_run_v2_service.coderunner)[0]].uri : (var.enable_vpc && var.use_existing_vpc && length(var.coderunner_vpc_networks) == 0 ? google_cloud_run_v2_service.coderunner_legacy[0].uri : null)
}

output "coderunner_service_name" {
  description = "CodeRunner Cloud Run service name (legacy, first network only)"
  value       = length(var.coderunner_vpc_networks) > 0 ? google_cloud_run_v2_service.coderunner[keys(google_cloud_run_v2_service.coderunner)[0]].name : (var.enable_vpc && var.use_existing_vpc && length(var.coderunner_vpc_networks) == 0 ? google_cloud_run_v2_service.coderunner_legacy[0].name : null)
}


