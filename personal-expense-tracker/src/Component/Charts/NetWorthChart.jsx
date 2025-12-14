import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function NetWorthChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        data: [92000, 101000, 112000, 118000, 124560],
        borderColor: "#4da3ff",
        backgroundColor: "rgba(77,163,255,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  return (
    <div className="card" style={{ height: 320 }}>
      <Line data={data} options={options} />
    </div>
  );
}