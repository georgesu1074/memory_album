import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary-600 mb-4 animate-fade-in">
          Memory Album
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl animate-slide-up">
          Share your cherished memories and photos from our special day
        </p>
        
        {/* Mobile-first CTA button */}
        <button className="btn-base bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 mt-8 animate-scale-in">
          Share a Memory
        </button>
      </div>
    </Layout>
  );
}