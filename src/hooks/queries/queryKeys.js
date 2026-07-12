export const queryKeys = {
  me: ['me'],
  events: {
    all: ['events'],
    allPublic: ['events', 'public'],
    list: (filters) => ['events', 'list', filters],
    featured: ['events', 'featured'],
    admin: ['events', 'admin'],
    pending: ['events', 'pending'],
    detail: (id) => ['events', 'detail', id],
  },
  banners: {
    all: ['banners'],
    approved: ['banners', { approvedOnly: true }],
  },
  spots: {
    byType: (spotType, page, search) => ['spots', spotType, page, search],
    byTypeOnly: (spotType) => ['spots', 'type', spotType],
    detail: (id) => ['spots', 'detail', id],
    all: ['spots', 'all'],
  },
  notifications: ['notifications'],
  newsletter: ['newsletter'],
  newsletterPage: (page, limit) => ['newsletter', page, limit],
  dashboard: ['dashboard'],
}
