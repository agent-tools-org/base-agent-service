// Data analysis utility — used by the service agent and tests.

export interface AnalysisRequest {
  dataset: number[];
}

export interface AnalysisResult {
  count: number;
  sum: number;
  mean: number;
  min: number;
  max: number;
  stddev: number;
}

export function performDataAnalysis(req: AnalysisRequest): AnalysisResult {
  const { dataset } = req;
  if (dataset.length === 0) {
    return { count: 0, sum: 0, mean: 0, min: 0, max: 0, stddev: 0 };
  }
  const count = dataset.length;
  const sum = dataset.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = Math.min(...dataset);
  const max = Math.max(...dataset);
  const variance =
    dataset.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count;
  const stddev = Math.sqrt(variance);
  return { count, sum, mean, min, max, stddev: Math.round(stddev * 1000) / 1000 };
}
