"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
// Using simple arrow symbols instead of icons for better performance
// import { ArrowLeft, ArrowRight, Trophy, Star, Play, Pause } from 'lucide-react';
import { transformProductForOldFormat } from '@/lib/data-fetcher';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category_id: number;
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  display_order: number;
}

export function BestsellersSection() {
  const t = useTranslations('bestsellers');
  const locale = useLocale();
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    fetchBestsellers();
  }, []);

  const fetchBestsellers = async () => {
    try {
      const response = await fetch('/api/products/bestsellers');
      if (response.ok) {
        const data: Product[] = await response.json();
        // تحويل البيانات للتنسيق المطلوب مع تمرير اللغة الحالية
        const transformedProducts = data.map(prod => transformProductForOldFormat(prod, locale));
        setBestsellers(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    } finally {
      setLoading(false);
    }
  };

  // وظائف السلايدر
  const nextSlide = () => {
    const container = document.querySelector('.bestsellers-scroll-container');
    if (container) {
      const cardWidth = 280 + 16; // عرض البطاقة + المسافة
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    const container = document.querySelector('.bestsellers-scroll-container');
    if (container) {
      const cardWidth = 280 + 16; // عرض البطاقة + المسافة
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 5; // xl - 5 منتجات
      if (window.innerWidth >= 1024) return 4; // lg - 4 منتجات
      if (window.innerWidth >= 768) return 3;  // md - 3 منتجات
      if (window.innerWidth >= 640) return 2;  // sm - 2 منتج
      return 1.5; // mobile - 1.5 منتج (يظهر جزء من التالي)
    }
    return 5;
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // دعم اللمس للأجهزة المحمولة
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // التحرك التلقائي
  useEffect(() => {
    if (isPlaying && bestsellers.length > 0) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000); // كل 4 ثواني
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bestsellers.length, currentSlide]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (bestsellers.length === 0) {
    return null; // لا تعرض القسم إذا لم توجد منتجات
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-secondary rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent rounded-full animate-ping"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* أدوات التحكم المبسطة */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
              className="text-muted-foreground hover:text-primary"
            >
              <span className="mr-1">{isPlaying ? '⏸️' : '▶️'}</span>
              {isPlaying ? t('pause') : t('play')}
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="h-8 w-8 rounded-full hover:bg-primary/10"
            >
              <span>→</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="h-8 w-8 rounded-full hover:bg-primary/10"
            >
              <span>←</span>
            </Button>
          </div>
        </div>

        {/* السلايدر الأفقي المستمر */}
        <div className="relative mb-8">
          {/* تأثير التدرج على الجوانب */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

          <div
            className="overflow-x-auto scrollbar-hide bestsellers-scroll-container"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
              {bestsellers.map((product, index) => (
                <div
                  key={product.id}
                  className="relative group flex-shrink-0"
                  style={{
                    width: 'calc(100vw - 80px)', // عرض كامل تقريباً على الجوال
                    maxWidth: '280px', // حد أقصى على الشاشات الكبيرة
                    minWidth: '240px'  // حد أدنى
                  }}
                >
                  {/* شارة الأكثر مبيعاً */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse shadow-lg">
                      <Trophy className="h-3 w-3" />
                      <span className="hidden sm:inline">الأكثر مبيعاً</span>
                      <span className="sm:hidden">#{index + 1}</span>
                    </div>
                  </div>

                  {/* تأثير التمييز */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}

              {/* عنصر إضافي للمساحة */}
              <div className="w-4 flex-shrink-0"></div>
            </div>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-xs bg-primary/20 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
              style={{
                width: `${((currentSlide + 1) / Math.max(1, Math.ceil(bestsellers.length / getItemsPerSlide()))) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* معلومات مبسطة */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{bestsellers.length} منتج من الأكثر مبيعاً</span>
            {isPlaying && (
              <>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                  تشغيل تلقائي
                </span>
              </>
            )}
          </div>
        </div>

        {/* زر عرض المزيد */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              const menuSection = document.querySelector('#menu-section');
              menuSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group"
          >
            <span>عرض جميع المنتجات</span>
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
