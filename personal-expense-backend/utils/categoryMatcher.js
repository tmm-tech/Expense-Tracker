const rules = [
  { match: /glovo/i, category: "Food" },
  { match: /uber eats/i, category: "Food" },
  { match: /kplc/i, category: "Utilities" },
  { match: /safaricom/i, category: "Bills" },
  { match: /apple\.com/i, category: "Subscriptions" },
  { match: /netflix/i, category: "Subscriptions" },
  { match: /mugi/i, category: "Family" },
  { match: /254700748919/i, category: "Self Transfer" },
  { match: /mpesa/i, category: "Transfer" },
];

function matchCategory(description, categories) {
  for (const rule of rules) {
    if (rule.match.test(description)) {
      const found = categories.find(
        (c) => c.name.toLowerCase() === rule.category.toLowerCase()
      );

      if (found) return found.id;
    }
  }

  return null;
}

module.exports = matchCategory;