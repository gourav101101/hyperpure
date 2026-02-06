"use client";
import { useEffect, useState } from "react";

export default function SellerForecast() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch(`/api/forecast?sellerId=${sellerId}`);
    if (res.ok) {
      const data = await res.json();
      setForecasts(data.forecasts || []);
    }
    setLoading(false);
  };

  const generateForecasts = async () => {
    setGenerating(true);
    const sellerId = localStorage.getItem('sellerId');
    const res = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId })
    });
    if (res.ok) {
      fetchForecasts();
    }
    setGenerating(false);
  };

  const getDemandColor = (demand: string) => {
    return {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    }[demand] || 'bg-gray-100 text-gray-700';
  };

  const getDemandIcon = (demand: string) => {
    return {
      high: '🔥',
      medium: '📊',
      low: '❄️'
    }[demand] || '📊';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demand Forecast</h2>
          <p className="text-sm text-gray-600 mt-1">AI-powered predictions for your products</p>
        </div>
        <button 
          onClick={generateForecasts}
          disabled={generating}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold disabled:bg-gray-400"
        >
          {generating ? '⏳ Generating...' : '🤖 Generate Forecast'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading forecasts...</div>
      ) : forecasts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-bold mb-2">No forecasts yet</h3>
          <p className="text-gray-600 mb-6">Generate AI-powered demand predictions for your products</p>
          <button onClick={generateForecasts} className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold">
            Generate Forecast
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.map((forecast) => (
            <div key={forecast._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={forecast.productId?.images?.[0]} 
                    alt={forecast.productId?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{forecast.productId?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDemandColor(forecast.recommendations.expectedDemand)}`}>
                        {getDemandIcon(forecast.recommendations.expectedDemand)} {forecast.recommendations.expectedDemand.toUpperCase()} DEMAND
                      </span>
                      <span className="text-xs text-gray-500">
                        {forecast.accuracy.toFixed(0)}% accuracy
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Suggested Stock</p>
                  <p className="text-2xl font-bold text-purple-600">{forecast.recommendations.suggestedStock}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Reorder Point</p>
                  <p className="text-2xl font-bold text-orange-600">{forecast.recommendations.reorderPoint}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Optimal Price</p>
                  <p className="text-2xl font-bold text-green-600">₹{forecast.recommendations.optimalPrice}</p>
                </div>
              </div>

              {forecast.predictions && forecast.predictions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">4-Week Prediction</h4>
                  <div className="space-y-2">
                    {forecast.predictions.slice(0, 4).map((pred: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="text-xs text-gray-600 w-24">
                          Week {idx + 1}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-blue-500 h-full rounded-full flex items-center justify-end pr-3"
                            style={{ width: `${Math.min((pred.predictedQuantity / forecast.recommendations.suggestedStock) * 100, 100)}%` }}
                          >
                            <span className="text-xs font-bold text-white">{pred.predictedQuantity} units</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 w-16">
                          {pred.confidence.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  💡 <strong>Recommendation:</strong> {
                    forecast.recommendations.expectedDemand === 'high' 
                      ? `High demand expected! Stock up to ${forecast.recommendations.suggestedStock} units to avoid stockouts.`
                      : forecast.recommendations.expectedDemand === 'medium'
                      ? `Moderate demand. Maintain ${forecast.recommendations.suggestedStock} units in stock.`
                      : `Low demand predicted. Keep ${forecast.recommendations.suggestedStock} units to minimize waste.`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How AI Forecasting Works</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Analyzes your last 30 days of sales data</li>
              <li>• Identifies trends and patterns</li>
              <li>• Predicts demand for next 4 weeks</li>
              <li>• Suggests optimal stock levels</li>
              <li>• Helps prevent stockouts and overstocking</li>
              <li>• Updates automatically as you get more orders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
