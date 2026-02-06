export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body);
    }
  }
}
