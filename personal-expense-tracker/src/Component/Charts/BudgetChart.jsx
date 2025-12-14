import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetChart() {
  const data = {
    labels: ["Food", "Rent", "Fun", "Travel"],
    datasets: [
      {
        data: [420, 1200, 260, 180],
        backgroundColor: [
          "#4da3ff",
          "#2cff9a",
          "#a78bfa",
          "#ff5c7c",
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "65%", // 👈 Donut style
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9aa4bf",
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: $${ctx.parsed.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="card" style={{ height: 320 }}>
      <Pie data={data} options={options} />
    </div>
  );
}