// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  grpc: {
    port: parseInt(process.env.GRPC_PORT ?? '9090', 10),
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'aws',
    aws: {
      region: process.env.AWS_REGION || 'ap-northeast-2',
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    gcp: {
      projectId: process.env.GCP_PROJECT_ID,
      bucket: process.env.GCP_STORAGE_BUCKET,
      keyFile: process.env.GCP_KEY_FILE,
    },
  },
  pdf: {
    templates: {
      creativeActivity: 'creative-activity-analysis',
      detailedAbilities: 'detailed-abilities-analysis',
      mindMap: 'mind-map-analysis',
      overall: 'overall-analysis',
    },
    options: {
      format: 'A4',
      orientation: 'portrait',
      includeCharts: true,
      theme: 'professional',
    },
  },
});
