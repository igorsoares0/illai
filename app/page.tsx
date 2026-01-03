export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[300px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6">
          <h1 className="text-xl font-bold">AI Illustrations</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <span className="font-medium">Creation Space</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="font-medium">Settings</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Credits Card */}
          <div className="mt-8 border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Credits</span>
              <span className="font-semibold">2/50</span>
            </div>
            <button className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Upgrade
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            <span className="font-medium">User Name</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-12 py-16">
        {/* Title */}
        <h2 className="text-4xl font-bold mb-8">Type your illustration description</h2>

        {/* Input Area */}
        <div className="w-full max-w-4xl mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask to build something..."
              className="w-full px-6 py-6 pr-16 bg-white border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Recent Creations */}
        <div className="w-full max-w-6xl">
          <h3 className="text-2xl font-semibold mb-6">Recent creations</h3>

          <div className="grid grid-cols-3 gap-6">
            {/* Card 1 - Christmas Cat */}
            <div className="aspect-square bg-green-700 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-white text-sm">
                Christmas illustration
              </div>
            </div>

            {/* Card 2 - Space Cat */}
            <div className="aspect-square bg-indigo-700 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-white text-sm">
                Space cat illustration
              </div>
            </div>

            {/* Card 3 - Houses */}
            <div className="aspect-square bg-yellow-400 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-black text-sm">
                Houses illustration
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
