"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus, RefreshCw } from "lucide-react";
import MemorySubmissionModal from "./MemorySubmissionModal";
import CategoryCard from "./memories/CategoryCard";
import MemoryDetailModal from "./memories/MemoryDetailModal";
import WeddingHeroSection from "./WeddingHeroSection";
import { WeddingWithDetails, getGroomDisplayName, getBrideDisplayName, getCoupleNames } from "@/types/wedding";

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
}

interface Category {
  id: string;
  name: string;
  summary: string | null;
  memory_count: number;
  memory_type: "bride" | "groom" | "both" | null;
  memories?: any[];
}

interface WeddingPageClientProps {
  wedding: WeddingWithDetails;
  guests: Guest[];
  categories: Category[];
  weddingSlug: string;
}

export default function WeddingPageClient({
  wedding,
  guests,
  categories: initialCategories,
  weddingSlug,
}: WeddingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "bride" | "groom" | "together"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isUpdatingAfterSubmission, setIsUpdatingAfterSubmission] = useState(false);
  const [totalCounts, setTotalCounts] = useState({
    all: 0,
    bride: 0,
    groom: 0,
    together: 0,
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);

  // Fetch total counts on mount and handle deep linking
  useEffect(() => {
    fetchTotalCounts();

    // Check for category hash in URL for deep linking
    if (window.location.hash) {
      const categoryId = window.location.hash.substring(1);
      const linkedCategory = categories.find((c) => c.id === categoryId);
      if (linkedCategory) {
        setSelectedCategory(linkedCategory);
        setIsDetailModalOpen(true);
      }
    }
  }, []);

  const fetchTotalCounts = async () => {
    try {
      // Fetch total counts for all tabs
      const response = await fetch(
        `/api/weddings/${weddingSlug}/categories/counts`
      );
      if (response.ok) {
        const counts = await response.json();
        setTotalCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching total counts:", error);
    }
  };

  // Load more categories for infinite scroll
  const loadMoreCategories = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/weddings/${weddingSlug}/categories?offset=${categories.length}&limit=6&type=${activeTab}`
      );

      if (response.ok) {
        const data = await response.json();
        setCategories((prev) => [...prev, ...data.categories]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error loading more categories:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [weddingSlug, categories.length, activeTab, isLoadingMore, hasMore]);

  // Refresh categories (for pull-to-refresh and after memory submission)
  const refreshCategories = useCallback(async (delay = 0, afterMemorySubmission = false) => {
    // Show updating indicator for memory submissions with delay
    if (afterMemorySubmission && delay > 0) {
      setIsUpdatingAfterSubmission(true);
    }
    
    // Add optional delay for memory submission to ensure server processing
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setIsLoadingCategories(true);
    setIsUpdatingAfterSubmission(false);
    try {
      // After memory submission, ALWAYS fetch ALL categories regardless of current tab
      // This ensures we get updates even if the new memory went to a different category type
      const typeParam = afterMemorySubmission ? 'all' : activeTab;
      
      // Fetch more categories when updating after submission to ensure we get everything
      const limit = afterMemorySubmission ? 50 : 20;
      
      const response = await fetch(
        `/api/weddings/${weddingSlug}/categories?offset=0&limit=${limit}&type=${typeParam}&t=${Date.now()}`
      );

      if (response.ok) {
        const data = await response.json();
        
        if (afterMemorySubmission) {
          // Replace ALL categories to ensure complete refresh
          setCategories(data.categories || []);
        } else {
          // For tab changes, just update with filtered results
          setCategories([...data.categories]);
        }
        
        setHasMore(afterMemorySubmission ? false : data.hasMore);
        // Also refresh total counts
        fetchTotalCounts();
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
    } finally {
      setIsLoadingCategories(false);
      setIsPullRefreshing(false);
    }
  }, [weddingSlug, activeTab]);

  // Filter categories based on active tab
  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => {
          const type = c.memory_type?.toLowerCase();
          if (activeTab === "together") return type === "both";
          return type === activeTab;
        });

  // We now use totalCounts from the API instead of calculating from loaded categories

  // Set up infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreCategories();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMoreCategories]);

  // Reset when tab changes
  useEffect(() => {
    setIsLoadingCategories(true); // Show loading state immediately
    setCategories([]);
    setHasMore(true);
    refreshCategories();
  }, [activeTab]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullStartY.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;

    // If pulled down more than 100px and at the top of the page
    if (diff > 100 && window.scrollY === 0 && !isPullRefreshing) {
      setIsPullRefreshing(true);
      refreshCategories();
    }
  };

  const handleTouchEnd = () => {
    pullStartY.current = null;
  };

  const themeColor = wedding.theme_color || '#8B5CF6';
  const secondaryColor = wedding.secondary_color || '#EC4899';

  return (
    <>
      <div
        className="min-h-screen bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Hero Section */}
        <WeddingHeroSection 
          wedding={wedding} 
          onShareMemory={() => setIsModalOpen(true)} 
        />

        {/* Pull-to-refresh indicator */}
        {isPullRefreshing && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-white rounded-full shadow-lg p-3">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ color: themeColor }} />
          </div>
        )}
        
        {/* Updating after submission indicator */}
        {isUpdatingAfterSubmission && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2"
               style={{ backgroundColor: themeColor }}>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing memory...</span>
          </div>
        )}
        {/* Sticky Tabs Container */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">

          {/* Tabs */}
          <div className="border-b">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex space-x-8">
              {(["all", "bride", "groom", "together"] as const).map((tab) => {
                const tabLabel = tab === "bride" && wedding.bride 
                  ? getBrideDisplayName(wedding)
                  : tab === "groom" && wedding.groom
                  ? getGroomDisplayName(wedding)
                  : tab === "together"
                  ? "Together"
                  : tab === "all"
                  ? "All"
                  : tab.charAt(0).toUpperCase() + tab.slice(1);
                  
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
                    style={{
                      borderColor: activeTab === tab ? themeColor : 'transparent',
                      color: activeTab === tab ? themeColor : '#6B7280',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.color = '#6B7280';
                      }
                    }}
                  >
                    {tabLabel} ({totalCounts[tab]})
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {isLoadingCategories && filteredCategories.length === 0 ? (
            // Simple, elegant loading state
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                {/* Spinning ring */}
                <div className="w-12 h-12 border-4 border-[#fdf0f2] rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#d4899f] rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm">Loading memories...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={`${category.id}-${category.memory_count}-${category.memories?.[0]?.memory_photos?.[0]?.id || ''}`}
                  category={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDetailModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {activeTab === "all"
                  ? "No memories shared yet"
                  : `No ${
                      activeTab === "together" ? "couple" : activeTab
                    } memories yet`}
              </p>
              <p className="text-sm text-gray-400">
                Be the first to share a memory!
              </p>
            </div>
          )}

          {/* Infinite scroll trigger */}
          {filteredCategories.length > 0 && (
            <div
              ref={loadMoreRef}
              className="h-20 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && filteredCategories.length > 0 && (
                <p className="text-sm text-gray-400">
                  No more memories to load
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 md:hidden"
        style={{ backgroundColor: themeColor }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        aria-label="Share Memory"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Memory Submission Modal */}
      <MemorySubmissionModal
        weddingSlug={weddingSlug}
        wedding={wedding}
        guests={guests}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Refresh when closing modal in case user closes after sharing
          refreshCategories(0, true);
        }}
        onMemoryAdded={() => refreshCategories(5000, true)}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        category={selectedCategory}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
}
