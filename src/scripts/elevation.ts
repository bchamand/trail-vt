import { Chart, registerables } from 'chart.js';
import type { TrackData } from './gpx-parser';

Chart.register(...registerables);

const GOLD = '#D4A843';
const TERRACOTTA = '#C4533A';

export function initElevationChart(
  canvas: HTMLCanvasElement,
  trackData: TrackData,
  onHover?: (index: number) => void,
): Chart {
  const ctx = canvas.getContext('2d')!;

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(196, 83, 58, 0.4)');
  gradient.addColorStop(1, 'rgba(196, 83, 58, 0.02)');

  // Build data as {x, y} points so X axis is linear (true distance)
  const dataPoints = trackData.distances.map((d, i) => ({
    x: d,
    y: trackData.elevations[i],
  }));

  const totalKm = Math.ceil(trackData.totalDistance);

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: dataPoints,
        borderColor: GOLD,
        borderWidth: 2,
        backgroundColor: gradient,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: GOLD,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(26, 24, 20, 0.95)',
          titleColor: GOLD,
          bodyColor: '#F5F0E8',
          borderColor: 'rgba(212, 168, 67, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items) => `${(items[0].parsed.x).toFixed(1)} km`,
            label: (item) => `Altitude : ${item.parsed.y} m`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: trackData.totalDistance,
          afterBuildTicks: (axis) => {
            const last = Math.floor(trackData.totalDistance);
            axis.ticks = [];
            for (let km = 0; km <= last; km++) {
              axis.ticks.push({ value: km });
            }
          },
          ticks: {
            color: 'rgba(245, 240, 232, 0.4)',
            font: { size: 10 },
            callback: (val) => `${val} km`,
          },
          grid: { color: 'rgba(245, 240, 232, 0.05)' },
          border: { color: 'rgba(245, 240, 232, 0.1)' },
        },
        y: {
          ticks: {
            color: 'rgba(245, 240, 232, 0.4)',
            font: { size: 10 },
            callback: (val) => `${val} m`,
          },
          grid: { color: 'rgba(245, 240, 232, 0.05)' },
          border: { color: 'rgba(245, 240, 232, 0.1)' },
        },
      },
      onHover: (_event, elements) => {
        if (elements.length > 0 && onHover) {
          onHover(elements[0].index);
        }
      },
    },
  });

  return chart;
}
