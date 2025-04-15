
export const WEBHOOK_PAYLOADS = {
  AD_SUGGESTIONS: {
    example: {
      context: 'Targeting tech startups in San Francisco',
      brand_guidelines: 'Minimalist design, blue and white color palette',
      landing_page_url: 'https://example.com/tech-solutions',
      target_audience: 'Tech startup founders',
      topic_area: 'SaaS Marketing',
      timestamp: new Date().toISOString()
    },
    fields: [
      { name: 'context', type: 'string', description: 'Campaign context' },
      { name: 'brand_guidelines', type: 'string', description: 'Brand guidelines' },
      { name: 'landing_page_url', type: 'string', description: 'Landing page URL' },
      { name: 'target_audience', type: 'string', description: 'Target audience' },
      { name: 'topic_area', type: 'string', description: 'Topic area' },
      { name: 'timestamp', type: 'string', description: 'ISO timestamp' }
    ]
  },
  AD_CATEGORIES: {
    example: {
      category: 'Tenant Experience',
      description: 'Enhancing tenant experiences through digital platforms',
      trending_topics: [
        'Tenant Communication Apps', 
        'Rent Payment Solutions', 
        'Building Community Platforms'
      ],
      timestamp: new Date().toISOString(),
      metadata: {
        background_style: 'bg-gradient-to-r from-violet-50 to-purple-50'
      }
    },
    fields: [
      { name: 'category', type: 'string', description: 'Category name' },
      { name: 'description', type: 'string', description: 'Category description' },
      { name: 'trending_topics', type: 'string[]', description: 'List of trending topics' },
      { name: 'timestamp', type: 'string', description: 'ISO timestamp' },
      { name: 'metadata', type: 'object', description: 'Additional metadata', 
        properties: [
          { name: 'background_style', type: 'string', description: 'Tailwind CSS background style' }
        ]
      }
    ]
  },
  PAGE_VIEW: {
    example: {
      category: 'Tenant Experience',
      page_view: true,
      request_type: 'ai_analysis',
      timestamp: new Date().toISOString(),
      category_slug: 'tenant-experience'
    },
    fields: [
      { name: 'category', type: 'string', description: 'Category name' },
      { name: 'page_view', type: 'boolean', description: 'Always true' },
      { name: 'request_type', type: 'string', description: 'Type of request' },
      { name: 'timestamp', type: 'string', description: 'ISO timestamp' },
      { name: 'category_slug', type: 'string', description: 'Slug of the category' }
    ]
  }
};
