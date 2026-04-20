# SnapDiet AI 🥗⚡

A premium AI-powered nutrition app built with Expo + React Native + TypeScript.

[![Expo](https://img.shields.io/badge/Expo-51-blue)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-green)](https://reactnative.dev)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Expo
npx expo start

# 3. Run on device
# iOS: Press 'i' or scan QR with Expo Go
# Android: Press 'a' or scan QR with Expo Go
```

---

## 📁 Project Structure

```
snapdiet/
├── App.tsx                          # Root entry point
├── app.json                         # Expo config
├── eas.json                         # EAS Build config
├── src/
│   ├── constants/
│   │   ├── colors.ts                # Full design system colors + rank colors
│   │   └── index.ts                 # Spacing, fonts, rank data, demo meals
│   ├── types/
│   │   └── index.ts                 # All TypeScript interfaces
│   ├── store/
│   │   └── appStore.ts              # Zustand global state
│   ├── services/
│   │   ├── aiService.ts             # AI meal analysis (OpenAI-ready)
│   │   ├── purchaseService.ts       # RevenueCat-ready IAP
│   │   └── storageService.ts        # AsyncStorage persistence
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # Stack navigator + onboarding gate
│   │   └── TabNavigator.tsx         # Bottom tabs with glowing scan button
│   ├── components/
│   │   ├── RankRing.tsx             # Animated XP progress ring (HERO)
│   │   ├── MacroBar.tsx             # Animated macro progress bars
│   │   ├── CircularProgress.tsx     # Reusable circular progress
│   │   ├── MealCard.tsx             # Meal display (compact + full)
│   │   ├── ChallengeCard.tsx        # Weekly challenge card
│   │   ├── WaterTracker.tsx         # Hydration tracker with quick-add
│   │   ├── ActionButton.tsx         # Multi-variant button
│   │   ├── FeatureCard.tsx          # Feature/upgrade card
│   │   ├── ChatBubble.tsx           # AI coach chat bubble
│   │   └── PaywallModal.tsx         # Premium upgrade modal
│   └── screens/
│       ├── OnboardingScreen.tsx     # 5-step onboarding with calorie calc
│       ├── HomeScreen.tsx           # Main dashboard (RankRing hero)
│       ├── ScanScreen.tsx           # Camera scan + image picker
│       ├── NutritionResultScreen.tsx # Full nutrition breakdown
│       ├── BarcodeScreen.tsx        # Barcode scanner (Pro)
│       ├── HistoryScreen.tsx        # Meal history with filters
│       ├── FastingScreen.tsx        # Fasting timer with protocols
│       ├── AICoachScreen.tsx        # AI nutrition coach chat (Premium)
│       ├── WeeklyReportScreen.tsx   # AI weekly report
│       ├── GroceryListScreen.tsx    # Smart grocery list (Pro)
│       ├── MoodTrackerScreen.tsx    # Mood & energy tracking (Premium)
│       ├── ProfileScreen.tsx        # Profile + subscription status
│       ├── SettingsScreen.tsx       # App settings
│       └── AchievementsScreen.tsx  # All achievements + badges
```

---

## 🎮 Rank System

Users earn XP for every action:

| Action | XP |
|---|---|
| Scan a meal | +50 XP |
| Hit calorie goal | +75 XP |
| Hit protein goal | +60 XP |
| Hit hydration goal | +40 XP |
| Streak bonus | +100 XP |
| Complete challenge | +150 XP |
| Daily login | +10 XP |

### Rank Progression

| Rank | XP Required | Color |
|---|---|---|
| 🥉 Bronze | 0 | #CD7F32 |
| 🥈 Silver | 500 | #C0C0C0 |
| 🥇 Gold | 1,500 | #FFD700 |
| 💎 Diamond | 3,000 | #4FC3F7 |
| 💚 Emerald | 6,000 | #00E676 |
| 👑 Champion | 10,000 | #E040FB |

---

## 💳 Subscription Tiers

### Free
- 1 meal scan per day
- Basic nutrition results
- 7 days meal history
- Basic challenges

### Pro ($14.99/mo · $8.99/mo annual)
- ✅ Unlimited meal scans
- ✅ Barcode scanner
- ✅ Hydration tracker
- ✅ Fasting timer
- ✅ Weekly AI reports
- ✅ Grocery list

### Premium ($29.99/mo · $19.99/mo annual)
- ✅ Everything in Pro
- ✅ AI Nutrition Coach chat
- ✅ Mood & energy tracking
- ✅ Custom meal plans
- ✅ Family mode
- ✅ Progress photos

---

## 🤖 Connecting Real AI (OpenAI)

In `src/services/aiService.ts`, replace the mock `analyzeFoodImage` method:

```typescript
async analyzeFoodImage(imageUri: string): Promise<NutritionAnalysis> {
  // Convert image to base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: 'text', text: 'Analyze this meal. Return JSON with: name, calories, protein, carbs, fat, fiber, sugar, healthScore (0-100), glycemicIndex (0-100), processingScore (0-100), suggestions (array of strings).' }
        ]
      }],
      max_tokens: 500,
      response_format: { type: 'json_object' }
    }),
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  // Map to Meal type...
}
```

---

## 💰 Connecting RevenueCat

1. Install: `npx expo install react-native-purchases`
2. Add plugin to `app.json`:
   ```json
   "plugins": ["react-native-purchases"]
   ```
3. In `src/services/purchaseService.ts`, uncomment RevenueCat code and add your API keys.

---

## 📱 App Store Submission

### iOS (App Store)

```bash
# Build for production
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

Required in App Store Connect:
- App name: SnapDiet AI
- Subtitle: AI Nutrition & Meal Scanner
- Category: Health & Fitness
- Age Rating: 4+
- Privacy Policy URL (required for camera/health data)
- Screenshots: 6.7", 5.5", iPad (if applicable)

### Android (Google Play)

```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

Required in Google Play Console:
- App name: SnapDiet AI
- Category: Health & Fitness
- Content rating: Everyone
- Data safety form (camera, storage access)
- Screenshots: Phone + 7" tablet

---

## 🎨 Design System

```
Background:    #0A0A0F  (near black)
Surface:       #16161F  (card background)
Elevated:      #1E1E2A  (raised elements)
Border:        #2A2A3A  (dividers/borders)
Primary Green: #00D68F  (CTAs, progress)
Cyan:          #4ECDC4  (water, secondary)
Gold:          #FFB800  (XP, achievements)
Red:           #FF4757  (warnings, over-limit)
White:         #FFFFFF
Secondary Text:#A0A0B0
```

---

## 🔧 Environment Variables

Create `.env` (not committed):
```
OPENAI_API_KEY=sk-...
REVENUECAT_IOS_KEY=appl_...
REVENUECAT_ANDROID_KEY=goog_...
```

Use `expo-constants` or a secrets manager to access in app.

---

## 📊 Data Persistence

All data persists via AsyncStorage with these keys:
- `@snapdiet_user` — user profile
- `@snapdiet_meals` — meal history (last 100)
- `@snapdiet_rank` — XP & rank progress
- `@snapdiet_subscription` — subscription status

---

## 🧪 Demo Mode

The app ships with 5 demo meals pre-loaded so the UI looks alive from day 1. These are defined in `src/constants/index.ts` → `DEMO_MEALS`.

---

## 📄 License

MIT — build freely, ship to the world. Attribution appreciated but not required.

---

Built with ❤️ using Expo + React Native
