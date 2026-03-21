function matchCategory(description, categories) {
  const text = description.toLowerCase();

  const rules = [
    { keyword: "glovo", category: "Food" },
    { keyword: "apple", category: "Subscriptions" },
    { keyword: "netflix", category: "Subscriptions" },
    { keyword: "spotify", category: "Subscriptions" },
    { keyword: "254700748919", category: "Self Transfer" },
    { keyword: "mugi", category: "Family" },
    { keyword: "kplc", category: "Utilities" },
    { keyword: "airtime", category: "Airtime" },
    { keyword: "fuel", category: "Transport" },
  ];

  for (const rule of rules) {
    if (text.includes(rule.keyword)) {
      const cat = categories.find(
        (c) =>
          c.name.toLowerCase() === rule.category.toLowerCase()
      );

      if (cat) return cat.id;
    }
  }

  return null;
}

module.exports = { matchCategory };