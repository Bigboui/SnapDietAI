import { Meal, NutritionAnalysis, WeeklyReport, ChatMessage } from '../types';

// ─── Meal Analysis ────────────────────────────────────────────────────────────

const MEAL_DATABASE: Record<string, Partial<Meal>> = {
  burger: {
    name: 'Classic Cheeseburger',
    calories: 750,
    protein: 35,
    carbs: 62,
    fat: 40,
    fiber: 2,
    sugar: 14,
    healthScore: 38,
    glycemicIndex: 68,
    processingScore: 72,
  },
  pizza: {
    name: 'Margherita Pizza (2 slices)',
    calories: 560,
    protein: 22,
    carbs: 72,
    fat: 20,
    fiber: 3,
    sugar: 8,
    healthScore: 48,
    glycemicIndex: 62,
    processingScore: 55,
  },
  salad: {
    name: 'Garden Fresh Salad',
    calories: 185,
    protein: 8,
    carbs: 22,
    fat: 8,
    fiber: 7,
    sugar: 12,
    healthScore: 94,
    glycemicIndex: 28,
    processingScore: 5,
  },
  chicken: {
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    healthScore: 96,
    glycemicIndex: 0,
    processingScore: 8,
  },
  pasta: {
    name: 'Spaghetti Bolognese',
    calories: 620,
    protein: 28,
    carbs: 78,
    fat: 22,
    fiber: 4,
    sugar: 9,
    healthScore: 52,
    glycemicIndex: 60,
    processingScore: 42,
  },
  smoothie: {
    name: 'Green Smoothie Bowl',
    calories: 290,
    protein: 12,
    carbs: 48,
    fat: 7,
    fiber: 9,
    sugar: 28,
    healthScore: 82,
    glycemicIndex: 42,
    processingScore: 12,
  },
  sushi: {
    name: 'Salmon Sushi Roll (8 pcs)',
    calories: 340,
    protein: 18,
    carbs: 52,
    fat: 8,
    fiber: 2,
    sugar: 6,
    healthScore: 80,
    glycemicIndex: 48,
    processingScore: 18,
  },
  oatmeal: {
    name: 'Overnight Oats with Berries',
    calories: 380,
    protein: 14,
    carbs: 62,
    fat: 9,
    fiber: 8,
    sugar: 18,
    healthScore: 88,
    glycemicIndex: 44,
    processingScore: 10,
  },
};

const MEAL_KEYS = Object.keys(MEAL_DATABASE);

const SUGGESTIONS_MAP: Record<string, string[]> = {
  high_fat: [
    '🥗 Try swapping the fries for a side salad to save ~200 calories.',
    '🫒 Consider adding avocado instead of cheese for healthier fats.',
  ],
  high_carb: [
    '🌾 Opt for whole grain alternatives to lower the glycemic impact.',
    '🥦 Balance with extra vegetables to slow carb absorption.',
  ],
  high_sugar: [
    '🍎 Watch the added sugars — aim to keep daily intake under 25g.',
    '💧 Pair with water instead of juice to reduce sugar load.',
  ],
  low_protein: [
    '🍗 Add a protein source like chicken, eggs, or Greek yogurt.',
    '🥚 Consider a protein shake on the side for muscle support.',
  ],
  great_meal: [
    '✅ Excellent nutritional balance! Keep it up.',
    '💪 Great protein-to-calorie ratio for muscle maintenance.',
  ],
};

function generateSuggestions(meal: Partial<Meal>): string[] {
  const suggestions: string[] = [];
  if ((meal.fat ?? 0) > 30) suggestions.push(...(SUGGESTIONS_MAP.high_fat ?? []));
  if ((meal.carbs ?? 0) > 70) suggestions.push(...(SUGGESTIONS_MAP.high_carb ?? []));
  if ((meal.sugar ?? 0) > 20) suggestions.push(...(SUGGESTIONS_MAP.high_sugar ?? []));
  if ((meal.protein ?? 0) < 15) suggestions.push(...(SUGGESTIONS_MAP.low_protein ?? []));
  if ((meal.healthScore ?? 0) >= 80) suggestions.push(...(SUGGESTIONS_MAP.great_meal ?? []));
  return suggestions.slice(0, 3);
}

class AIService {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async analyzeFoodImage(_imageUri: string): Promise<NutritionAnalysis> {
    // Simulate AI processing time
    await this.delay(2500);

    // Pick a random meal from database
    const randomKey = MEAL_KEYS[Math.floor(Math.random() * MEAL_KEYS.length)];
    const mealData = MEAL_DATABASE[randomKey]!;

    const meal: Meal = {
      id: Date.now().toString(),
      name: mealData.name ?? 'Unknown Meal',
      calories: mealData.calories ?? 400,
      protein: mealData.protein ?? 20,
      carbs: mealData.carbs ?? 40,
      fat: mealData.fat ?? 15,
      fiber: mealData.fiber ?? 3,
      sugar: mealData.sugar ?? 8,
      healthScore: mealData.healthScore ?? 65,
      glycemicIndex: mealData.glycemicIndex ?? 50,
      processingScore: mealData.processingScore ?? 30,
      imageUrl: _imageUri,
      timestamp: Date.now(),
      mealType: 'lunch',
    };

    const suggestions = generateSuggestions(mealData);
    const warnings: string[] = [];
    const healthHighlights: string[] = [];

    if ((mealData.processingScore ?? 0) > 60) {
      warnings.push('⚠️ Highly processed food — limit to occasional treats.');
    }
    if ((mealData.glycemicIndex ?? 0) > 65) {
      warnings.push('📈 High glycemic index may cause blood sugar spikes.');
    }
    if ((mealData.healthScore ?? 0) >= 85) {
      healthHighlights.push('🌿 Whole food ingredients — excellent choice!');
    }
    if ((mealData.protein ?? 0) > 25) {
      healthHighlights.push('💪 High protein content supports muscle recovery.');
    }
    if ((mealData.fiber ?? 0) >= 6) {
      healthHighlights.push('🌾 Good fiber content supports digestive health.');
    }

    return { meal, suggestions, warnings, healthHighlights };
  }

  async analyzeBarcodeFood(barcode: string): Promise<NutritionAnalysis> {
    await this.delay(1200);

    const meal: Meal = {
      id: Date.now().toString(),
      name: 'Scanned Product',
      calories: 180,
      protein: 8,
      carbs: 24,
      fat: 6,
      fiber: 2,
      sugar: 10,
      healthScore: 62,
      glycemicIndex: 55,
      processingScore: 48,
      imageUrl: null,
      timestamp: Date.now(),
      mealType: 'snack',
      isBarcode: true,
      barcode,
    };

    return {
      meal,
      suggestions: ['🛒 Check serving size — this product is often underestimated.'],
      warnings: ['⚠️ Contains added preservatives.'],
      healthHighlights: ['Low in saturated fat.'],
    };
  }

  async chatWithCoach(
    messages: ChatMessage[],
    userContext: string
  ): Promise<string> {
    await this.delay(1800);

    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? '';

    if (lastMessage.includes('protein')) {
      return "Great question about protein! Based on your goals, you should aim for **1.6–2.2g per kg of body weight**. For your current weight, that's roughly **120–150g daily**. Your best sources are chicken breast, Greek yogurt, eggs, and whey protein. Your recent meals show you're averaging about 85g — let's close that gap! Try adding a protein shake post-workout. 💪";
    }
    if (lastMessage.includes('weight') || lastMessage.includes('lose')) {
      return "Weight loss is about creating a **sustainable calorie deficit**. I recommend starting with just 300–400 calories below your maintenance level. Crash diets backfire 90% of the time. Based on your logs this week, you're doing well — just watch the weekend meals which tend to spike. Small, consistent choices beat dramatic changes every time. 🎯";
    }
    if (lastMessage.includes('meal plan') || lastMessage.includes('plan')) {
      return "Here's a simple daily framework for your goals:\n\n**Breakfast**: Oats + protein powder + berries (~400 cal)\n**Lunch**: Chicken rice bowl + veggies (~550 cal)\n**Dinner**: Salmon + sweet potato + salad (~480 cal)\n**Snack**: Greek yogurt + almonds (~250 cal)\n\nTotal: ~1,680 cal with 140g protein. Want me to adjust based on your preferences?";
    }
    if (lastMessage.includes('cheat') || lastMessage.includes('bad')) {
      return "One bad meal doesn't ruin your progress — just like one good meal doesn't transform your body. What matters is the **weekly average**. You're doing great overall this week. Get back on track with your next meal and don't restrict to 'make up' for it. That cycle is counterproductive. You've got this! 🙌";
    }
    if (lastMessage.includes('water') || lastMessage.includes('hydration')) {
      return "Hydration is massively underrated! Aim for **35ml per kg of body weight** as your baseline, more on workout days. Signs you're dehydrated: dark urine, afternoon energy crashes, and hunger that won't quit after eating. Your tracker shows you're hitting about 70% of your goal — try keeping a water bottle visible at your desk as a reminder. 💧";
    }

    return "I'm analyzing your nutrition data and I'm impressed by your consistency! Here's what I notice: your protein intake is solid on weekdays but drops on weekends. Your biggest opportunity is **adding more fiber** — it'll help with satiety and gut health. You're at 3 days into your streak, keep pushing for that 7-day milestone! What specific area would you like to optimize? 🤖✨";
  }

  async generateWeeklyReport(
    weekMeals: Meal[],
    goalsHit: { calories: number; protein: number; water: number }
  ): Promise<WeeklyReport> {
    await this.delay(1500);

    const avgCalories = weekMeals.length
      ? Math.round(weekMeals.reduce((s, m) => s + m.calories, 0) / 7)
      : 0;
    const avgProtein = weekMeals.length
      ? Math.round(weekMeals.reduce((s, m) => s + m.protein, 0) / 7)
      : 0;

    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0] ?? '';
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - 7);
    const weekStart = weekStartDate.toISOString().split('T')[0] ?? '';

    return {
      weekStart,
      weekEnd,
      averageCalories: avgCalories,
      averageProtein: avgProtein,
      daysOnTrack: goalsHit.calories,
      biggestWin:
        goalsHit.protein >= 4
          ? '🏆 You hit your protein goal ' + goalsHit.protein + ' days this week!'
          : '🔥 You logged meals every day — consistency is key!',
      biggestIssue:
        avgCalories > 2200
          ? '📉 Average calories slightly above target. Watch weekend dinners.'
          : '💧 Water intake could be higher — you hit it only ' + goalsHit.water + ' days.',
      recommendation:
        'Focus on pre-planning your weekend meals. Your weekday habits are excellent — extend that discipline to Saturday and Sunday for breakthrough results.',
      totalXPEarned: 450,
      mealsLogged: weekMeals.length,
      waterGoalsDays: goalsHit.water,
      generatedAt: Date.now(),
    };
  }
}

export const aiService = new AIService();
