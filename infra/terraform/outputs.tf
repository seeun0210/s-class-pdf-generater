output "cloud_run_uri" {
  description = "Deployed Cloud Run URL"
  value       = google_cloud_run_v2_service.service.uri
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository path"
  value       = google_artifact_registry_repository.repo.id
}


