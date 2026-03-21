exports.matchCategory = (description, categories) => {
  const text = description.toLowerCase();

  const rules = [
    {
      keywords: ["glovo"],
      category: "Food",
    },
    {
      keywords: ["apple"],
      category: "Subscriptions",
    },
    {
      keywords: ["netflix"],
      category: "Subscriptions",
    },
    {
      keywords: ["254700748919"],
      category: "Self Transfer",
    },
    {
      keywords: ["mugi"],
      category: "Family",
    },
    {
      keywords: ["kplc"],
      category: "Utilities",
    },
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        const cat = categories.find(
          (c) =>
            c.name.toLowerCase() ===
            rule.category.toLowerCase()
        );

        if (cat) return cat.id;
      }
    }
  }

  return null;
};