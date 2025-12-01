export enum VideoCategory {
  MUSIC = 'الموسيقى (Music)',
  GAMING = 'ألعاب الفيديو (Gaming)',
  TECH = 'تقنية واختراعات',
  EDUCATION = 'تعليم وشروحات',
  ENTERTAINMENT = 'ترفيه وكوميديا',
  VLOG = 'يوميات وفلوقات',
  SPORTS = 'رياضة',
  COOKING = 'طبخ ووصفات',
  NEWS = 'أخبار وترندات',
  HEALTH = 'صحة ولياقة',
  BUSINESS = 'بزنس ومال',
  ART = 'فن وتصميم',
  RELIGIOUS = 'محتوى ديني',
  OTHER = 'أخرى'
}

export interface ThumbnailIdea {
  description: string;
  text: string;
}

export interface SEOResponse {
  titles: string[];
  description: string;
  keywords: string[];
  hashtags: string[];
  category: string;
  algorithmStrategy: string;
  thumbnailIdeas: ThumbnailIdea[];
}

export interface GenerateParams {
  topic: string;
  category: VideoCategory;
  audience: string;
}