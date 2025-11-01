# Infrastructure Architecture

## 현재 구축된 아키텍처

```mermaid
graph TB
    subgraph "univ-recommand 프로젝트"
        subgraph "Production VPC: s-class-platform-network"
            subgraph "Subnet: s-class-platform-subnet (asia-northeast3)"
                SpringProd["Spring 서버<br/>(s-class-platform)<br/>Compute Engine"]
                SubnetProd["서브넷 CIDR<br/>(예: 10.x.x.x/24)"]
            end

            VPCConnProd["VPC Access Connector<br/>pdf-vpc-conn-prod<br/>CIDR: 10.8.0.0/28"]

            subgraph "Cloud Run Services (Internal Only)"
                CodeRunnerProd["CodeRunner-Prod<br/>coderunner-prod<br/>INGRESS_TRAFFIC_INTERNAL_ONLY<br/>egress: PRIVATE_RANGES_ONLY"]
            end
        end

        subgraph "Development VPC: s-class-platform-network-dev"
            subgraph "Subnet: s-class-platform-subnet-dev (asia-northeast3)"
                SpringDev["Spring 서버<br/>(s-class-platform-dev)<br/>Compute Engine"]
                SubnetDev["서브넷 CIDR<br/>(예: 10.x.x.x/24)"]
            end

            VPCConnDev["VPC Access Connector<br/>pdf-vpc-conn-dev<br/>CIDR: 10.9.0.0/28"]

            subgraph "Cloud Run Services (Internal Only)"
                CodeRunnerDev["CodeRunner-Dev<br/>coderunner-dev<br/>INGRESS_TRAFFIC_INTERNAL_ONLY<br/>egress: PRIVATE_RANGES_ONLY"]
            end
        end

        subgraph "IAM & Service Accounts"
            SAProd["sclassplatform-service-account<br/>@univ-recommand.iam.gserviceaccount.com"]
            SADev["sclassplatform-sa-dev<br/>@univ-recommand.iam.gserviceaccount.com"]
        end

        subgraph "Firewall Rules"
            FWProd["s-class-pdf-allow-internal-prod<br/>Allow: TCP/UDP/ICMP<br/>Source: Subnet CIDR"]
            FWDev["s-class-pdf-allow-internal-dev<br/>Allow: TCP/UDP/ICMP<br/>Source: Subnet CIDR"]
        end
    end

    %% Production 네트워크 연결
    SpringProd -->|"gRPC 요청<br/>(VPC 내부)"| CodeRunnerProd
    CodeRunnerProd -.->|"VPC Connector<br/>통해 연결"| VPCConnProd
    VPCConnProd -->|"네트워크 연결"| SubnetProd

    %% Development 네트워크 연결
    SpringDev -->|"gRPC 요청<br/>(VPC 내부)"| CodeRunnerDev
    CodeRunnerDev -.->|"VPC Connector<br/>통해 연결"| VPCConnDev
    VPCConnDev -->|"네트워크 연결"| SubnetDev

    %% IAM 연결
    SAProd -->|"roles/run.invoker"| CodeRunnerProd
    SAProd -->|"roles/run.invoker"| CodeRunnerDev
    SADev -->|"roles/run.invoker"| CodeRunnerProd
    SADev -->|"roles/run.invoker"| CodeRunnerDev

    %% 방화벽 적용
    FWProd -.->|"적용"| SpringProd
    FWProd -.->|"적용"| CodeRunnerProd
    FWDev -.->|"적용"| SpringDev
    FWDev -.->|"적용"| CodeRunnerDev

    style SpringProd fill:#90EE90
    style SpringDev fill:#FFE4B5
    style CodeRunnerProd fill:#87CEEB
    style CodeRunnerDev fill:#DDA0DD
    style VPCConnProd fill:#FFD700
    style VPCConnDev fill:#FFD700
    style SAProd fill:#F0E68C
    style SADev fill:#F0E68C
```

## 네트워크 플로우 상세도

```mermaid
sequenceDiagram
    participant Spring as Spring 서버<br/>(Compute Engine)
    participant Subnet as VPC Subnet
    participant FW as Firewall Rule
    participant VPCConn as VPC Access Connector
    participant CodeRunner as CodeRunner<br/>(Cloud Run)

    Note over Spring,CodeRunner: Production/Development 환경별로 동일한 플로우

    Spring->>Subnet: gRPC 요청 (VPC 내부 IP)
    Subnet->>FW: 트래픽 검사
    FW->>FW: Source CIDR 확인<br/>(서브넷 내부 허용)
    FW->>VPCConn: 허용된 트래픽 전달
    VPCConn->>CodeRunner: VPC Connector를 통한 연결<br/>(Private IP)
    CodeRunner->>CodeRunner: IAM 권한 확인<br/>(roles/run.invoker)
    CodeRunner->>VPCConn: 응답 (VPC 내부로)
    VPCConn->>Subnet: 응답 전달
    Subnet->>Spring: gRPC 응답
```

## VPC 및 서브넷 구조

```mermaid
graph LR
    subgraph "VPC: s-class-platform-network (Production)"
        direction TB
        SP1["Subnet: s-class-platform-subnet<br/>Region: asia-northeast3<br/>CIDR: 예) 10.1.0.0/24"]
        SP1 --> IP1["IP 범위 내 리소스:<br/>- Spring 서버 인스턴스<br/>- VPC Connector (10.8.0.0/28)"]
    end

    subgraph "VPC: s-class-platform-network-dev (Development)"
        direction TB
        SD1["Subnet: s-class-platform-subnet-dev<br/>Region: asia-northeast3<br/>CIDR: 예) 10.2.0.0/24"]
        SD1 --> IP2["IP 범위 내 리소스:<br/>- Spring 서버 인스턴스<br/>- VPC Connector (10.9.0.0/28)"]
    end

    style SP1 fill:#E6F3FF
    style SD1 fill:#FFF4E6
    style IP1 fill:#F0F8FF
    style IP2 fill:#FFF8F0
```

## 주요 특징

### 1. **네트워크 격리**

- Production과 Development 환경이 별도의 VPC로 완전히 분리됨
- 각 VPC는 독립적인 서브넷과 방화벽 규칙 보유

### 2. **VPC Access Connector 역할**

- **CIDR 할당**:
  - Production: `10.8.0.0/28` (16개 IP 주소)
  - Development: `10.9.0.0/28` (16개 IP 주소)
- **목적**: Cloud Run 서비스가 VPC 내부 리소스와 통신하기 위한 브리지
- **트래픽 라우팅**: Cloud Run → VPC Connector → VPC 내부 리소스

### 3. **보안 설정**

- **Ingress**: `INGRESS_TRAFFIC_INTERNAL_ONLY` - VPC 내부에서만 접근 가능
- **Egress**: `PRIVATE_RANGES_ONLY` - 모든 아웃바운드 트래픽이 VPC를 통해 라우팅
- **Firewall**: 서브넷 CIDR 범위 내에서만 통신 허용

### 4. **IAM 권한**

- Spring 서버의 서비스 계정들이 CodeRunner에 `roles/run.invoker` 권한 보유
- 프로젝트 내부이므로 직접 IAM 바인딩 가능

### 5. **통신 경로**

```
Spring 서버 (Compute Engine)
  ↓ (VPC 내부 IP)
서브넷 (s-class-platform-subnet)
  ↓ (방화벽 규칙 확인)
VPC Connector (pdf-vpc-conn-prod)
  ↓ (Private IP)
CodeRunner Cloud Run 서비스
```

## 리소스 요약

| 리소스                 | Production                              | Development                               |
| ---------------------- | --------------------------------------- | ----------------------------------------- |
| **VPC Network**        | s-class-platform-network                | s-class-platform-network-dev              |
| **Subnet**             | s-class-platform-subnet                 | s-class-platform-subnet-dev               |
| **VPC Connector**      | pdf-vpc-conn-prod<br/>CIDR: 10.8.0.0/28 | pdf-vpc-conn-dev<br/>CIDR: 10.9.0.0/28    |
| **CodeRunner Service** | coderunner-prod                         | coderunner-dev                            |
| **Spring 서버**        | s-class-platform<br/>(Compute Engine)   | s-class-platform-dev<br/>(Compute Engine) |
| **Service Account**    | sclassplatform-service-account          | sclassplatform-sa-dev                     |
