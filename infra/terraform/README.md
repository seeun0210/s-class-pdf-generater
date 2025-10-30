# Cloud Run gRPC 배포 – Terraform

이 모듈은 Nest gRPC 서비스를 Cloud Run에 배포합니다. 컨테이너 이미지는 미리 빌드/푸시되어 있어야 합니다.

## 전제 조건

- gcloud 로그인 및 프로젝트 선택 완료
- Terraform 1.5+
- 컨테이너 이미지가 Artifact Registry에 존재

## 변수 설정

`terraform.tfvars` 예시:

```
project_id = "your-gcp-project-id"
region     = "asia-northeast3"
service_name = "s-class-pdf"
image = "asia-northeast3-docker.pkg.dev/your-gcp-project-id/s-class-pdf-repo/s-class-pdf:latest"
allow_unauthenticated = false
cpu = 2
memory = "1Gi"
concurrency = 10
timeout_seconds = 300
```

## 초기화 및 배포

```bash
cd infra/terraform
terraform init
terraform plan -out plan.tfplan
tfapply() { terraform apply -auto-approve "$@"; }; tfapply plan.tfplan
```

## 출력값

- cloud_run_uri: Cloud Run 서비스 URL
- artifact_registry_repo: 아티팩트 레지스트리 리포 경로

## 이미지 빌드/푸시(참고)

```bash
# Artifact Registry 리포 생성은 Terraform이 수행
REGION=asia-northeast3
PROJECT=your-gcp-project-id
REPO=s-class-pdf-repo
IMAGE=s-class-pdf
TAG=latest

gcloud auth configure-docker ${REGION}-docker.pkg.dev

docker build -t ${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${IMAGE}:${TAG} -f Dockerfile .

docker push ${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${IMAGE}:${TAG}
```

## 메모

- Cloud Run에서 gRPC 사용 시 컨테이너는 8080 포트(h2c)로 리슨하면 됩니다. 이 설정은 리소스에 포함되어 있습니다.
- 공개 접근이 필요 없다면 allow_unauthenticated=false로 두고, 호출자는 Cloud Run Invoker 권한을 가져야 합니다.
