export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Hyperpure, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily access the materials on Hyperpure for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Seller Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sellers must provide accurate product information and pricing</li>
              <li>Products must meet quality and safety standards</li>
              <li>Sellers are responsible for order fulfillment and delivery</li>
              <li>Commission rates apply as per seller tier</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Buyer Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Buyers must provide accurate delivery information</li>
              <li>Payment must be completed before order processing</li>
              <li>Returns and refunds subject to policy terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment Terms</h2>
            <p>All payments are processed securely. Sellers receive payouts after successful delivery and completion of hold period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Activities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Selling counterfeit or illegal products</li>
              <li>Fraudulent activities or misrepresentation</li>
              <li>Violation of intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>Hyperpure shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modifications</h2>
            <p>Hyperpure reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h2>
            <p>For questions about these Terms & Conditions, please contact us at support@hyperpure.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
