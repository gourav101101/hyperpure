// Commission Calculator Component - Shows Zomato Model
export function CommissionCalculator({ sellerPrice, commission }: any) {
  if (!sellerPrice || !commission) return null;
  
  const basePrice = parseFloat(sellerPrice);
  const commissionAmount = basePrice * commission.commissionRate / 100;
  const customerPrice = basePrice + commissionAmount;
  
  return (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">Your Base Price</span>
        <span className="font-bold">{basePrice.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-orange-600">+ Platform Fee ({commission.commissionRate}%)</span>
        <span className="font-bold text-orange-600">+{commissionAmount.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-xs pt-2 border-t border-green-200">
        <span className="font-bold text-gray-900">Customer Pays</span>
        <span className="font-bold text-blue-600">{customerPrice.toFixed(2)}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-green-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-700 font-bold"> You Receive</span>
          <span className="font-bold text-green-600">{basePrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
