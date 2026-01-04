"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

interface Illustration {
  id: string;
  url: string;
  prompt: string;
}

type ModelType = "recraft-ai/recraft-20b-svg" | "recraft-ai/recraft-v3-svg";

const modelStyles = {
  "recraft-ai/recraft-v3-svg": [
    { value: "any", label: "Any" },
    { value: "engraving", label: "Engraving" },
    { value: "line_art", label: "Line Art" },
    { value: "line_circuit", label: "Line Circuit" },
    { value: "linocut", label: "Linocut" },
  ],
  "recraft-ai/recraft-20b-svg": [
    { value: "vector_illustration", label: "Vector Illustration" },
    { value: "icon/doodle_fill", label: "Icon Doodle Fill" },
  ],
};

const CREDIT_COSTS = {
  "recraft-ai/recraft-20b-svg": 1,
  "recraft-ai/recraft-v3-svg": 2,
};

export default function Home() {
  const { data: session, update: updateSession } = useSession();
  const [prompt, setPrompt] = useState("");
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("recraft-ai/recraft-20b-svg");
  const [style, setStyle] = useState("vector_illustration");
  const [credits, setCredits] = useState(session?.user?.credits || 0);

  useEffect(() => {
    if (session?.user?.credits !== undefined) {
      setCredits(session.user.credits);
    }
  }, [session]);

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
    if (model === "recraft-ai/recraft-20b-svg") {
      setStyle("vector_illustration");
    } else if (model === "recraft-ai/recraft-v3-svg") {
      setStyle("any");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isGenerating) return;

    const creditCost = CREDIT_COSTS[selectedModel];
    if (credits < creditCost) {
      alert(`Insufficient credits. This model requires ${creditCost} credit${creditCost > 1 ? 's' : ''}. You have ${credits} credits.`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          style,
          size: "1024x1024",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          alert(`Insufficient credits. You need ${data.required} credits but have ${data.available}.`);
        } else {
          throw new Error(data.error || "Failed to generate illustration");
        }
        return;
      }

      const newIllustration: Illustration = {
        id: Date.now().toString(),
        url: data.url,
        prompt,
      };

      setIllustrations([newIllustration, ...illustrations]);
      setPrompt("");

      // Update credits
      setCredits(data.creditsRemaining);
      await updateSession();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate illustration. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
              <span className="font-semibold">{credits}</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Recraft 20B: 1 credit</p>
              <p>Recraft V3: 2 credits</p>
            </div>
            <button className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Upgrade
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium block truncate text-sm">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-12 py-16">
        {/* Title */}
        <h2 className="text-4xl font-bold mb-8">Type your illustration description</h2>

        {/* Input Area */}
        <form onSubmit={handleGenerate} className="w-full max-w-4xl mb-16">
          <div className="relative bg-white border border-gray-300 rounded-2xl px-6 pt-6 pb-4">
            <input
              type="text"
              placeholder="Ask to build something..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full text-base bg-transparent focus:outline-none disabled:opacity-50 mb-3"
            />

            <div className="flex items-center justify-end gap-3">
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value as ModelType)}
                className="px-3 py-2 bg-transparent border-none text-sm focus:outline-none cursor-pointer appearance-none pr-6"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "20px",
                }}
              >
                <option value="recraft-ai/recraft-20b-svg">Recraft 20b(fast)</option>
                <option value="recraft-ai/recraft-v3-svg">Recraft V3 (Quality)</option>
              </select>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isGenerating ? (
                  <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Recent Creations */}
        <div className="w-full max-w-6xl">
          <h3 className="text-2xl font-semibold mb-6">Recent creations</h3>

          {illustrations.length === 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {/* Placeholder Cards */}
              <div className="aspect-square bg-green-700 rounded-2xl overflow-hidden flex items-center justify-center">
                <p className="text-white text-sm">Example illustration</p>
              </div>
              <div className="aspect-square bg-indigo-700 rounded-2xl overflow-hidden flex items-center justify-center">
                <p className="text-white text-sm">Example illustration</p>
              </div>
              <div className="aspect-square bg-yellow-400 rounded-2xl overflow-hidden flex items-center justify-center">
                <p className="text-black text-sm">Example illustration</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {illustrations.map((illustration) => (
                <div
                  key={illustration.id}
                  className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-4"
                >
                  <img
                    src={illustration.url}
                    alt={illustration.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
