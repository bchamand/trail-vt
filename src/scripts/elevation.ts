import { Chart, registerables } from 'chart.js';
import type { TrackData } from './gpx-parser';

Chart.register(...registerables);

const BRIQUE = '#B85A3E';
const TEXT = '#3B2F26';
const TEXT_MUTED = 'rgba(59, 47, 38, 0.5)';
const GRID = 'rgba(59, 47, 38, 0.08)';
const BORDER = 'rgba(59, 47, 38, 0.15)';

export function initElevationChart(
  canvas: HTMLCanvasElement,
  trackData: TrackData,
  onHover?: (index: number) => void,
): Chart {
  const ctx = canvas.getContext('2d')!;

  // Gradient fill — brique toulousaine warm wash
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(184, 90, 62, 0.35)');
  gradient.addColorStop(1, 'rgba(184, 90, 62, 0.03)');

  const dataPoints = trackData.distances.map((d, i) => ({
    x: d,
    y: trackData.elevations[i],
  }));

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: dataPoints,
        borderColor: BRIQUE,
        borderWidth: 2,
        backgroundColor: gradient,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: BRIQUE,
        pointHoverBorderColor: '#FAF5EB',
        pointHoverBorderWidth: 2,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeInOutCubic',
      },
      transitions: {
        active: {
          animation: { duration: 200 },
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(250, 245, 235, 0.98)',
          titleColor: BRIQUE,
          bodyColor: TEXT,
          borderColor: 'rgba(184, 90, 62, 0.3)',
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
            color: TEXT_MUTED,
            font: { size: 10 },
            callback: (val) => `${val} km`,
          },
          grid: { color: GRID },
          border: { color: BORDER },
        },
        y: {
          ticks: {
            color: TEXT_MUTED,
            font: { size: 10 },
            callback: (val) => `${val} m`,
          },
          grid: { color: GRID },
          border: { color: BORDER },
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

/** Update an existing chart with new track data (animated transition) */
export function updateElevationChart(
  chart: Chart,
  trackData: TrackData,
  onHover?: (index: number) => void,
): void {
  const dataPoints = trackData.distances.map((d, i) => ({
    x: d,
    y: trackData.elevations[i],
  }));

  chart.data.datasets[0].data = dataPoints;

  const xScale = chart.options.scales!.x!;
  (xScale as any).min = 0;
  (xScale as any).max = trackData.totalDistance;
  (xScale as any).afterBuildTicks = (axis: any) => {
    const last = Math.floor(trackData.totalDistance);
    axis.ticks = [];
    for (let km = 0; km <= last; km++) {
      axis.ticks.push({ value: km });
    }
  };

  chart.options.onHover = (_event: any, elements: any[]) => {
    if (elements.length > 0 && onHover) {
      onHover(elements[0].index);
    }
  };

  chart.update('default');
}
