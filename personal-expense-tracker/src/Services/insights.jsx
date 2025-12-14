export function generateInsights(current, previous) {
  const insights = [];

  if (current.spend > previous.spend) {
    insights.push(
      `You spent $${current.spend - previous.spend} more than last period.`
    );
  }

  if (current.savings < previous.savings) {
    insights.push(
      `Your savings rate dropped by ${previous.savings - current.savings}%.`
    );
  }

  if (current.netWorth > previous.netWorth) {
    insights.push("Your net worth increased — great progress.");
  }

  return insights;
}