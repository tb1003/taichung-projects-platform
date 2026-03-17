import { MapPin, Building2, Trees, ShoppingCart, Star } from 'lucide-react';

export interface CategoryStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof MapPin;
  label: string;
}

export const SLOGAN_CATEGORIES: Record<string, CategoryStyle> = {
  '地段價值': {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: MapPin,
    label: '地段價值',
  },
  '品牌建築': {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Building2,
    label: '品牌建築',
  },
  '生活環境': {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: Trees,
    label: '生活環境',
  },
  '生活機能': {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: ShoppingCart,
    label: '生活機能',
  },
  '產品特色': {
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    icon: Star,
    label: '產品特色',
  },
  '其他': {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: MapPin,
    label: '其他',
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return SLOGAN_CATEGORIES[category] || SLOGAN_CATEGORIES['其他'];
}
