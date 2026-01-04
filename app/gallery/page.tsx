"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface Generation {
  id: string;
  prompt: string;
  model: string;
  credits: number;
  imageUrl: string;
  createdAt: string;
}

interface GenerationsResponse {
  items: Generation[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function Gallery() {
  const { data: session } = useSession();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchGenerations = async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/generations?cursor=${cursor}&limit=12`
        : `/api/generations?limit=12`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch generations");
      }

      const data: GenerationsResponse = await response.json();

      if (cursor) {
        setGenerations((prev) => [...prev, ...data.items]);
      } else {
        setGenerations(data.items);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching generations:", error);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await fetchGenerations();
      setIsLoading(false);
    };

    loadInitial();
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    await fetchGenerations(nextCursor);
    setIsLoadingMore(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
          <Link
            href="/"
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">Creation Space</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Link>

          <Link
            href="/gallery"
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 transition-colors"
          >
            <span className="font-medium">My Gallery</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>

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
              <span className="font-semibold">{session?.user?.credits || 0}</span>
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
      <main className="flex-1 px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">My Gallery</h2>
            <p className="text-gray-600">
              {generations.length > 0
                ? `${generations.length} illustration${generations.length !== 1 ? "s" : ""}`
                : "No illustrations yet"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No illustrations yet</h3>
              <p className="text-gray-600 mb-6">Start creating your first AI illustration</p>
              <Link
                href="/"
                className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Create Illustration
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generations.map((generation) => (
                  <div
                    key={generation.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                      <img
                        src={generation.imageUrl}
                        alt={generation.prompt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium mb-2 line-clamp-2">
                        {generation.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{generation.model}</span>
                        <span>{generation.credits} credit{generation.credits !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {formatDate(generation.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
