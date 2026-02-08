import type { Meal, DayPlan, ShoppingItem, IngredientCategory } from "@/types";

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  produce: [
    "lettuce", "tomato", "onion", "garlic", "pepper", "broccoli", "spinach",
    "cucumber", "carrot", "potato", "basil", "lemon", "lime", "asparagus",
    "mushroom", "sweet potato", "zucchini", "avocado", "cilantro", "ginger",
    "celery", "corn", "peas", "bean sprout", "cabbage", "kale", "parsley",
    "mint", "scallion", "green onion", "shallot", "chili",
  ],
  meat: [
    "chicken", "beef", "pork", "salmon", "cod", "shrimp", "fish", "lamb",
    "turkey", "bacon", "sausage", "steak", "ground beef", "ground turkey",
    "prawn", "tuna", "mince",
  ],
  dairy: [
    "cheese", "butter", "milk", "cream", "yogurt", "egg", "mozzarella",
    "feta", "parmesan", "sour cream", "cheddar", "ricotta", "cream cheese",
  ],
  grains: [
    "rice", "pasta", "bread", "flour", "spaghetti", "penne", "noodle",
    "tortilla", "bun", "taco shell", "arborio", "quinoa", "couscous",
    "oats", "panko", "breadcrumb",
  ],
  canned: [
    "canned", "tomato paste", "coconut milk", "broth", "stock", "chickpea",
    "lentil", "bamboo shoot", "diced tomatoes", "crushed tomatoes",
    "tomato sauce", "bean",
  ],
  spices: [
    "salt", "pepper", "cumin", "curry", "seasoning", "oregano", "soy sauce",
    "olive oil", "sesame oil", "honey", "balsamic", "vinegar", "paprika",
    "thyme", "rosemary", "cinnamon", "turmeric", "chili powder",
    "cayenne", "mustard", "ketchup", "mayonnaise", "hot sauce",
    "fish sauce", "worcestershire", "sugar",
  ],
  other: [],
};

function categorize(ingredientName: string): IngredientCategory {
  const lower = ingredientName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as IngredientCategory;
    }
  }
  return "other";
}

export function generateShoppingList(
  days: DayPlan[],
  meals: Meal[]
): ShoppingItem[] {
  const itemMap = new Map<string, ShoppingItem>();

  days.forEach((day) => {
    if (!day.mealId) return;
    const meal = meals.find((m) => m.id === day.mealId);
    if (!meal) return;

    meal.ingredients.forEach((ingredient) => {
      const key = ingredient.name.toLowerCase().trim();
      if (!key) return;
      const existing = itemMap.get(key);

      if (existing) {
        if (!existing.fromMeals.includes(meal.title)) {
          existing.fromMeals.push(meal.title);
        }
        if (
          ingredient.quantity &&
          existing.quantity &&
          existing.unit === ingredient.unit
        ) {
          const existingQty = parseFloat(existing.quantity);
          const newQty = parseFloat(ingredient.quantity);
          if (!isNaN(existingQty) && !isNaN(newQty)) {
            existing.quantity = (existingQty + newQty).toString();
          }
        }
      } else {
        itemMap.set(key, {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: categorize(ingredient.name),
          checked: false,
          fromMeals: [meal.title],
        });
      }
    });
  });

  return [...itemMap.values()].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}
