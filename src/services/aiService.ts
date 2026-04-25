import * as FileSystem from 'expo-file-system';
import { Meal, NutritionAnalysis, WeeklyReport, ChatMessage } from '../types';

const VERCEL_API_URL = 'https://snap-diet-ai.vercel.app/api/analyze';
const OPENAI_API_KEY = '';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: object[], maxTokens = 800): Promise<string> {
  const res = await fetch(OPENAI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-4o', max_tokens: maxTokens, messages }) });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

class AIService {
  async analyzeFoodImage(imageUri: string): Promise<NutritionAnalysis> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      const res = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const p = await res.json();
      const meal: Meal = { id: Date.now().toString(), name: p.foodName ?? 'Meal', calories: p.calories ?? 400, protein: p.protein ?? 20, carbs: p.carbs ?? 40, fat: p.fat ?? 15, fiber: p.fiber ?? 3, sugar: p.sugar ?? 8, healthScore: p.healthScore ?? 65, glycemicIndex: p.glycemicIndex ?? 50, processingScore: p.processingScore ?? 30, imageUrl: imageUri, timestamp: Date.now(), mealType: p.mealType ?? 'lunch' };
      return { meal, suggestions: p.suggestions ?? [], warnings: p.warnings ?? [], healthHighlights: p.healthHighlights ?? [] };
    } catch { return this.fallback(imageUri); }
  }
  async analyzeBarcodeFood(barcode: string): Promise<NutritionAnalysis> { return this.fallback(null, barcode); }
  async chatWithCoach(messages: ChatMessage[], userContext: string): Promise<string> {
    try { return await callOpenAI([{ role: 'system', content: `Expert nutrition coach. Concise, emojis. Context: ${userContext}` }, ...messages.map((m) => ({ role: m.role, content: m.content }))], 300); }
    catch { return 'Connection error. Try again!'; }
  }
  async generateWeeklyReport(weekMeals: Meal[], goalsHit: { calories: number; protein: number; water: number }): Promise<WeeklyReport> {
    const avgCalories = weekMeals.length ? Math.round(weekMeals.reduce((s, m) => s + m.calories, 0) / 7) : 0;
    const avgProtein = weekMeals.length ? Math.round(weekMeals.reduce((s, m) => s + m.protein, 0) / 7) : 0;
    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0] ?? '';
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0] ?? '';
    return { weekStart, weekEnd, averageCalories: avgCalories, averageProtein: avgProtein, daysOnTrack: goalsHit.calories, biggestWin: 'Great consistency!', biggestIssue: 'Drink more water.', recommendation: 'Pre-plan weekend meals.', totalXPEarned: weekMeals.length * 50, mealsLogged: weekMeals.length, waterGoalsDays: goalsHit.water, generatedAt: Date.now() };
  }
  private fallback(imageUri: string | null, barcode?: string): NutritionAnalysis {
    return { meal: { id: Date.now().toString(), name: barcode ? 'Scanned Product' : 'Analyzed Meal', calories: 400, protein: 20, carbs: 45, fat: 15, fiber: 4, sugar: 8, healthScore: 65, glycemicIndex: 50, processingScore: 35, imageUrl: imageUri, timestamp: Date.now(), mealType: 'lunch', isBarcode: !!barcode, barcode }, suggestions: [], warnings: [], healthHighlights: [] };
  }
}
export const aiService = new AIService();