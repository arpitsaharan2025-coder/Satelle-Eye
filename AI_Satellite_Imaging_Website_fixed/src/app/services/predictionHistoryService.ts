import { DisasterPrediction, PredictionResponse } from './geminiPredictionService';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  predictions: DisasterPrediction[];
  summary: string;
  riskLevel: string;
}

const HISTORY_KEY = 'satell_eye_prediction_history';

export const PredictionHistoryService = {
  getHistory: (): HistoryEntry[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load prediction history:', error);
      return [];
    }
  },

  addEntry: (response: PredictionResponse) => {
    try {
      const history = PredictionHistoryService.getHistory();
      
      const newEntry: HistoryEntry = {
        id: `HIST-${Date.now()}`,
        timestamp: new Date().toISOString(),
        predictions: response.predictions,
        summary: `Generated ${response.totalPredictions} predictions with ${response.globalRiskLevel} risk level`,
        riskLevel: response.globalRiskLevel
      };
      
      // Keep last 50 entries
      const updatedHistory = [newEntry, ...history].slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      console.error('Failed to save prediction history:', error);
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  },

  exportHistory: (): string => {
    const history = PredictionHistoryService.getHistory();
    return JSON.stringify(history, null, 2);
  }
};
