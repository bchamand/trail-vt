import { Chart, registerables } from 'chart.js';
import type { TrackData } from './gpx-parser';

Chart.register(...registerables);

const GOLD = '#D4A843';

function getThemeColors() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    tickColor: dark ? 'rgba(245, 240, 232, 0.4)' : 'rgba(26, 24, 20, 0.4)',
    gridColor: dark ? 'rgba(245, 240, 232, 0.05)' : 'rgba(26, 24, 20, 0.08)',
    borderColor: dark ? 'rgba(245, 240, 232, 0.1)' : 'rgba(26, 24, 20, 0.15)',
    tooltipBg: dark ? 'rgba(26, 24, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBody: dark ? '#F5F0E8' : '#1A1814',
    hoverBorder: dark ? '#fff' : '#1A1814',
  };
}

export function initElevationChart(
  canvas: HTMLCanvasElement,
  trackData: TrackData,
  onHover?: (index: number) => void,
): Chart {
  const ctx = canvas.getContext('2d')!;
  const theme = getThemeColors();

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(196, 83, 58, 0.4)');
  gradient.addColorStop(1, 'rgba(196, 83, 58, 0.02)');

  const dataPoints = trackData.distances.map((d, i) => ({
    x: d,
    y: trackData.elevations[i],
  }));

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
        pointHoverBorderColor: theme.hoverBorder,
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
          backgroundColor: theme.tooltipBg,
          titleColor: GOLD,
          bodyColor: theme.tooltipBody,
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
            color: theme.tickColor,
            font: { size: 10 },
            callback: (val) => Number.isInteger(val) ? `${val} km` : null,
          },
          grid: { color: theme.gridColor },
          border: { color: theme.borderColor },
        },
        y: {
          ticks: {
            color: theme.tickColor,
            font: { size: 10 },
            callback: (val) => `${val} m`,
          },
          grid: { color: theme.gridColor },
          border: { color: theme.borderColor },
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
