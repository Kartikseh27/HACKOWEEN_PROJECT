/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CropHealthInput,
  CropHealthAnalysisResult,
  WeatherRiskResult,
  SoilParameters,
  SoilAnalysisResult,
  MandiCalculationInput,
  MandiProfitResult,
  MandiPriceRecord,
  SchemeInfo,
  LossClaimDraft,
  UniversalAgentExecutionResult,
  FarmerReport,
  Language,
} from '../types';

const API_TIMEOUT = 30000;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function getEndpoint(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = getEndpoint(url);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    throw new Error(error.name === 'AbortError' ? 'Request timed out. Please verify connectivity.' : error.message);
  }
}

export const api = {
  async getHealth() {
    const res = await fetchWithTimeout('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async analyzeCrop(input: CropHealthInput): Promise<CropHealthAnalysisResult> {
    const res = await fetchWithTimeout('/api/crop/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Crop analysis service error');
    }
    return res.json();
  },

  async getWeather(state: string, district: string, crop: string = 'Wheat'): Promise<WeatherRiskResult> {
    const params = new URLSearchParams({ state, district, crop });
    const res = await fetchWithTimeout(`/api/weather/lookup?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Weather service error');
    }
    return res.json();
  },

  async analyzeSoil(params: SoilParameters & { state?: string; district?: string; crop?: string; files?: any[] }): Promise<SoilAnalysisResult> {
    const res = await fetchWithTimeout('/api/soil/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Soil analysis error');
    }
    return res.json();
  },

  async getMandiPrices(commodity: string, state: string, district: string): Promise<{ records: MandiPriceRecord[] }> {
    const params = new URLSearchParams({ commodity, state, district });
    const res = await fetchWithTimeout(`/api/mandi/prices?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Mandi prices error');
    }
    return res.json();
  },

  async calculateMandiProfit(input: MandiCalculationInput): Promise<MandiProfitResult> {
    const res = await fetchWithTimeout('/api/mandi/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Profit calculation error');
    }
    return res.json();
  },

  async getSchemes(): Promise<{ schemes: SchemeInfo[] }> {
    const res = await fetchWithTimeout('/api/schemes/list');
    if (!res.ok) throw new Error('Failed to retrieve schemes');
    return res.json();
  },

  async draftLossClaim(params: any): Promise<LossClaimDraft> {
    const res = await fetchWithTimeout('/api/schemes/draft-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Claim generator error');
    }
    return res.json();
  },

  async orchestrateAgent(params: {
    prompt: string;
    location: { state: string; district: string };
    cropContext: string;
    files: any[];
    language: Language;
    engine?: 'native' | 'n8n';
  }): Promise<UniversalAgentExecutionResult> {
    const res = await fetchWithTimeout('/api/agent/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Agent execution failed');
    }
    return res.json();
  },

  async getAgentEngineStatus(): Promise<any> {
    const res = await fetchWithTimeout('/api/agent/engine-status');
    if (!res.ok) return null;
    return res.json();
  },

  async generateReport(payload: Partial<FarmerReport>): Promise<FarmerReport> {
    const res = await fetchWithTimeout('/api/report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Report generation error');
    }
    return res.json();
  },
};
