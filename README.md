# S-Class PDF Converter

창의적 체험활동 분석 보고서를 PDF로 변환하는 gRPC 마이크로서비스입니다.

## ☁️ Cloud Run 배포 가이드 & 주의사항

### 필수 체크리스트

- **이미지 아키텍처**: Cloud Run은 linux/amd64 권장 → `docker buildx build --platform linux/amd64 ... --push`
- **Chromium 포함**: 런타임에 브라우저 설치 필요. Dockerfile은 Debian slim 기반으로 `chromium`과 `fonts-noto-cjk` 설치.
- **Puppeteer 실행 옵션**: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`, `--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage` 사용.
- **gRPC Proto 경로**: 빌드 산출물 기준으로 읽음 → `protoPath = join(__dirname, 'proto', 'pdf-generation.proto')`.
- **템플릿 자산 포함**: `nest-cli.json`에 `assets: ['proto/**/*', 'templates/**/*']` 설정. 서비스는 `__dirname/../templates`에서 로드.
- **@grpc/proto-loader 의존성**: 반드시 runtime dependencies에 포함(`dependencies`). lockfile 갱신 필요: `pnpm install`.
- **Terraform 이미지 태그**: `infra/terraform/terraform.tfvars`의 `image`를 항상 새 태그로 업데이트하여 새 리비전 트리거.
- **State Lock**: 로컬 backend 사용 시 동시 `apply` 금지. 필요 시 프로세스 종료 후 `terraform.tfstate.lock.info` 삭제.

### Docker 빌드/푸시 (예시)

```bash
pnpm install && pnpm build
docker buildx create --name cross --use || true
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64 \
  -t asia-northeast3-docker.pkg.dev/<PROJECT>/<REPO>/s-class-pdf:<TAG> \
  -f Dockerfile . --push
```

### Terraform 배포 (예시)

```bash
cd infra/terraform
# terraform.tfvars 의 image 값을 새 태그로 교체
terraform apply -auto-approve
```

### grpcurl 테스트 (Cloud Run, 인증 필요)

```bash
# (권장) 서비스 계정 가장(impersonation)으로 ID 토큰 발급
gcloud iam service-accounts add-iam-policy-binding \
  sclass-invoker@<PROJECT>.iam.gserviceaccount.com \
  --member="user:<YOUR_USER>@gmail.com" \
  --role="roles/iam.serviceAccountTokenCreator"

TOKEN=$(gcloud auth print-identity-token \
  --impersonate-service-account=sclass-invoker@<PROJECT>.iam.gserviceaccount.com \
  --audiences=https://<SERVICE_HOST>.a.run.app)

grpcurl \
  -d '{
    "session_id":"string",
    "analysis_type":"creativeActivity",
    "template_name":"creativeActivity",
    "analysis_data_json":"{}",
    "options":{"format":"A4","orientation":"portrait","margins":{"top":"20mm","bottom":"20mm","left":"20mm","right":"20mm"}}
  }' \
  -import-path src/proto \
  -proto pdf-generation.proto \
  -authority <SERVICE_HOST>.a.run.app \
  -H "Authorization: Bearer $TOKEN" \
  <SERVICE_HOST>.a.run.app:443 \
  pdf.generation.PdfGenerationService/GeneratePdf
```

### Spring(Java) 클라이언트 연결 팁

- 채널: `host = <SERVICE_HOST>.a.run.app`, `port = 443`, `useTransportSecurity()`
- 인증: Google ADC로 `IdTokenCredentials(targetAudience = https://<SERVICE_HOST>.a.run.app)` 생성 후 `MoreCallCredentials.from(...)`를 stub에 부착
- 네트워크: IPv6 문제 시 JVM 옵션 `-Djava.net.preferIPv4Stack=true`
- gRPC 버전 정합: `grpc-netty-shaded`, `grpc-protobuf`, `grpc-stub` 버전 통일

### 트러블슈팅 핵심

- "exec format error": amd64로 재빌드
- "Image not found": Artifact Registry에 푸시 여부/태그 확인
- "@grpc/proto-loader missing": runtime dependencies로 이동 + lockfile 갱신 후 재빌드
- "Template file not found":
  - 로그에 `/app/src/templates/...`가 보이면 오래된 리비전 → 새 이미지/태그로 재배포
  - `nest-cli.json` assets와 `pdf.service.ts` 경로(`__dirname/../templates`) 확인
- Cloud Run Ready=False & PORT:8080 리슨 실패:
  - `startup_probe` TCP 8080 확인, 초기 부팅 지연 시 `failure_threshold/period/timeout` 상향

````
## 🏗️ 아키텍처 개요

```mermaid
graph TB
    Client[gRPC Client] -->|PDF Generation Request| Gateway[gRPC Gateway :9090]
    Gateway --> Controller[PdfGrpcController]
    Controller --> Service[PdfService]
    Service --> Converter[DataConverterFactory]
    Service --> Template[Handlebars Template]
    Service --> Browser[Puppeteer + Chrome]
    Converter --> CreativeConverter[CreativeActivityDataConverter]
    Template --> HTML[HTML Template]
    Browser --> PDF[Generated PDF]

    subgraph "NestJS Application"
        Controller
        Service
        Converter
    end

    subgraph "External Dependencies"
        Template
        Browser
    end
````

## 📋 주요 구성 요소

### 1. gRPC 서비스 레이어

- **Proto 정의**: `src/proto/pdf-generation.proto`
- **패키지**: `pdf.generation`
- **서비스**: `PdfGenerationService`
- **메서드**: `GeneratePdf`

### 2. 컨트롤러 레이어

- **파일**: `src/pdf/pdf-grpc.controller.ts`
- **역할**: gRPC 요청 처리 및 응답 반환
- **데코레이터**: `@PdfGenerationServiceControllerMethods()`

### 3. 서비스 레이어

- **파일**: `src/pdf/pdf.service.ts`
- **역할**: PDF 생성 로직 처리
- **기능**:
  - 데이터 변환
  - 템플릿 렌더링
  - PDF 생성 (Puppeteer)

### 4. 데이터 변환 레이어

- **팩토리**: `src/pdf/converter/data-converter.factory.ts`
- **컨버터**: `src/pdf/converter/creative-activity-data.converter.ts`
- **역할**: 분석 데이터를 템플릿 데이터로 변환

### 5. 템플릿 레이어

- **파일**: `src/templates/create-activity-analysis.hbs`
- **엔진**: Handlebars
- **스타일**: CSS (Noto Sans KR 폰트)

## 🔧 기술 스택

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **gRPC**: @grpc/grpc-js, @grpc/proto-loader
- **PDF Generation**: Puppeteer + Chrome
- **Template Engine**: Handlebars

### Dependencies

```json
{
  "@nestjs/microservices": "^11.1.7",
  "@grpc/grpc-js": "^1.14.0",
  "@grpc/proto-loader": "^0.7.10",
  "puppeteer": "^24.26.1",
  "handlebars": "^4.7.8"
}
```

## 📊 데이터 플로우

```mermaid
sequenceDiagram
    participant Client
    participant gRPC as gRPC Service
    participant Controller as PdfGrpcController
    participant Service as PdfService
    participant Converter as DataConverter
    participant Template as Handlebars
    participant Browser as Puppeteer

    Client->>gRPC: GeneratePdf Request
    gRPC->>Controller: Route Request
    Controller->>Service: generate()
    Service->>Converter: convert()
    Converter-->>Service: Template Data
    Service->>Template: render()
    Template-->>Service: HTML
    Service->>Browser: generate PDF
    Browser-->>Service: PDF Buffer
    Service-->>Controller: PDF Buffer
    Controller-->>gRPC: Response
    gRPC-->>Client: PDF Data
```

## 🚀 실행 방법

### 개발 환경

```bash
# 의존성 설치
pnpm install

# Chrome 브라우저 설치 (Puppeteer용)
npx puppeteer browsers install chrome

# 개발 서버 실행
pnpm run start:dev
```

### 프로덕션 환경

```bash
# 빌드
pnpm run build

# 프로덕션 실행
node dist/main.js
```

## 📡 gRPC API

### 서비스 정의

```protobuf
service PdfGenerationService {
  rpc GeneratePdf(PdfGenerationRequest) returns (PdfGenerationResponse);
}
```

### 요청 메시지

```protobuf
message PdfGenerationRequest {
  string session_id = 1;
  string analysis_type = 2;
  string template_name = 3;
  AnalysisData analysis_data = 4;
  PdfOptions options = 5;
}
```

### 응답 메시지

```protobuf
message PdfGenerationResponse {
  bool success = 1;
  string message = 2;
  bytes pdf_data = 3;
  string file_name = 4;
}
```

## 📁 프로젝트 구조

```
src/
├── proto/
│   └── pdf-generation.proto          # gRPC 서비스 정의
├── pdf/
│   ├── pdf-grpc.controller.ts       # gRPC 컨트롤러
│   ├── pdf.service.ts               # PDF 생성 서비스
│   ├── pdf.module.ts                # PDF 모듈
│   └── converter/
│       ├── data-converter.factory.ts
│       ├── creative-activity-data.converter.ts
│       └── type/
│           ├── common.types.ts
│           └── creative-activity.types.ts
├── templates/
│   └── create-activity-analysis.hbs # PDF 템플릿
├── config/
│   └── configuration.ts             # 설정 관리
├── app.module.ts                    # 애플리케이션 모듈
└── main.ts                          # 애플리케이션 진입점
```

## 🔧 설정

### 환경 변수

- `PORT`: HTTP 서버 포트 (기본값: 3000)
- `GRPC_PORT`: gRPC 서버 포트 (기본값: 9090)

### 템플릿 경로

- **개발**: `src/templates/`
- **프로덕션**: `dist/templates/` (Nest assets 복사, 코드에선 `__dirname/../templates` 사용)

## 📝 사용 예시

### gRPC 클라이언트 예시

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Proto 파일 로드
const packageDefinition = protoLoader.loadSync(
  'src/proto/pdf-generation.proto',
);
const pdfGenerationProto =
  grpc.loadPackageDefinition(packageDefinition).pdf.generation;

// 클라이언트 생성
const client = new pdfGenerationProto.PdfGenerationService(
  'localhost:9090',
  grpc.credentials.createInsecure(),
);

// PDF 생성 요청
const request = {
  session_id: 'test-session',
  analysis_type: 'creative_activity',
  template_name: 'create-activity-analysis',
  analysis_data: {
    creative_activity: {
      autonomous_activity: {
        summary: '자율활동 요약',
        analysis: '자율활동 분석',
        evaluation: '자율활동 평가',
      },
      // ... 기타 활동 데이터
    },
  },
  options: {
    format: 'A4',
    orientation: 'portrait',
  },
};

client.GeneratePdf(request, (error, response) => {
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('PDF 생성 성공:', response.success);
  console.log('파일 크기:', response.pdf_data.length, 'bytes');
});
```

## 🐳 Docker 배포 (예시)

```dockerfile
FROM node:18-alpine

# Chrome 의존성 설치
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Puppeteer Chrome 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY src/templates/ ./src/templates/

EXPOSE 3000 9090

CMD ["node", "dist/main.js"]
```

## 🔍 모니터링 및 로깅

### 로그 레벨

- **INFO**: 일반적인 작업 로그
- **ERROR**: 오류 및 예외 상황
- **DEBUG**: 상세한 디버깅 정보

### 주요 로그

```
[PdfGrpcController] gRPC PDF generation request received: {sessionId}
[PdfService] {analysisType} PDF 생성 완료
[PdfService] Template rendering error: {error}
```

## 🚨 트러블슈팅

### 자주 발생하는 문제

1. **Chrome 브라우저 없음**

   ```bash
   npx puppeteer browsers install chrome
   ```

2. **포트 충돌 (9090)**

   ```bash
   lsof -i :9090
   kill -9 <PID>
   ```

3. **템플릿 파일 없음**
   - `src/templates/create-activity-analysis.hbs` 파일 존재 확인
   - 상대 경로 설정 확인

4. **gRPC 연결 실패**
   - proto 파일 경로 확인
   - 패키지 이름 일치 확인 (`pdf.generation`)

## 📈 성능 최적화

### 권장사항

- **Chrome 인스턴스 재사용**: 브라우저 풀링 구현
- **템플릿 캐싱**: Handlebars 템플릿 컴파일 결과 캐싱
- **메모리 관리**: PDF 버퍼 즉시 해제
- **병렬 처리**: 여러 PDF 동시 생성

## 🔒 보안 고려사항

- **gRPC TLS**: 프로덕션 환경에서 TLS 암호화 사용
- **입력 검증**: 요청 데이터 유효성 검사
- **리소스 제한**: 메모리 및 CPU 사용량 모니터링
- **파일 접근**: 템플릿 파일 경로 검증

## 📚 참고 자료

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [gRPC Node.js](https://grpc.io/docs/languages/node/)
- [Puppeteer](https://pptr.dev/)
- [Handlebars](https://handlebarsjs.com/)

---

**개발자**: S-Class Team  
**버전**: 1.0.0  
**라이선스**: MIT
