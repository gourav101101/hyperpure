export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-semibold text-gray-900">Zomato Hyperpure Private Limited</p>
              <p className="text-sm">Ground Floor, 12A, 94 Meghdoot, Nehru Place,<br/>New Delhi - 110019</p>
              <p className="text-sm">CIN: U74900DL2015PTC286208</p>
              <a href="tel:011-41171717" className="flex items-center gap-2 text-red-500 hover:text-red-600">
                <span>📞</span> 011-41171717
              </a>
              <a href="mailto:help@hyperpure.com" className="flex items-center gap-2 text-red-500 hover:text-red-600">
                <span>✉️</span> help@hyperpure.com
              </a>
            </div>
          </div>

          {/* Know More */}
          <div>
            <h3 className="font-bold text-lg mb-4">Know More</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-gray-900">Blog</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Corporate Announcements</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Governance</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Terms of use</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Supplier Code of Conduct</a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">Weather Union</a>
            </div>
          </div>

          {/* Follow us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow us on</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-800">
                <span className="text-xl">in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-800">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-800">
                <span className="text-xl">▶️</span>
              </a>
            </div>
          </div>

          {/* Logo & Apps */}
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mb-2">
                <span className="text-white text-4xl font-bold">h</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">hyperpure</div>
                <div className="text-xs text-gray-500 tracking-wider">BY ZOMATO</div>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="#" className="block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
              </a>
              <a href="#" className="block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <a href="#" className="hover:text-gray-700">fssai License No. 10020064002537</a>
          <p>Copyright © Hyperpure All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
