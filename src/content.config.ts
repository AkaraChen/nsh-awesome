import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const langSchema = z.enum(['en', 'zh']);
const dateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.date().transform((d) => d.toISOString().slice(0, 10)),
]);

const localizedTextSchema = z.object({
  en: z.string(),
  zh: z.string(),
});

const tableSchema = z.object({
  heading: z.string(),
  intro: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const relatedLinkSchema = z.object({
  path: z.string(),
  label: z.string(),
  reason: z.string(),
});

const calloutSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

const entries = defineCollection({
  loader: file('data/entries.json', {
    parser: (text) => JSON.parse(text).entries,
  }),
  schema: z.object({
    id: z.string().optional(),
    name: z.string(),
    section: z.enum(['nshm', 'framework', 'templates', 'articles']),
    category: z.string(),
    kind: z.string(),
    installable: z.boolean(),
    sourceType: z.string(),
    installCommand: z.string().nullable(),
    version: z.string().nullable(),
    nshVersion: z.string().nullable(),
    description: localizedTextSchema,
    sourceUrl: z.string().url(),
    cratesUrl: z.string().url().nullable(),
    homepage: z.string().url().nullable(),
    platforms: z.array(z.string()).min(1),
    license: z.string(),
    updatedAt: dateSchema,
    notes: localizedTextSchema.nullable(),
  }),
});

const modules = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/modules' }),
  schema: z.object({
    entryId: z.string(),
    lang: langSchema,
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    summary: z.string(),
    updatedAt: dateSchema,
    platformSupport: z.object({
      heading: z.string(),
      overview: z.string(),
      matrix: z.array(
        z.object({
          platform: z.string(),
          status: z.string(),
          notes: z.string(),
        }),
      ),
    }),
    securityNote: calloutSchema,
    related: z.array(
      z.object({
        id: z.string(),
        path: z.string(),
        name: z.string(),
        reason: z.string(),
      }),
    ),
    parentLinks: z.array(
      z.object({
        path: z.string(),
        label: z.string(),
      }),
    ),
  }),
});

const homePageSchema = z.object({
  pageType: z.literal('home'),
  pageSlug: z.literal('home'),
  lang: langSchema,
  title: z.string(),
  description: z.string(),
  h1: z.string(),
  lead: z.string(),
  updatedAt: dateSchema,
});

const sectionPageSchema = z.object({
  pageType: z.literal('section'),
  pageSlug: z.enum(['nshm', 'framework', 'templates', 'guides']),
  entriesSection: z.enum(['nshm', 'framework', 'templates', 'articles']),
  lang: langSchema,
  title: z.string(),
  description: z.string(),
  h1: z.string(),
  lead: z.string(),
  updatedAt: dateSchema,
  technicalCallout: calloutSchema,
  comparisonTable: tableSchema,
  selectionAdvice: z.object({
    heading: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    ),
  }),
  relatedLinks: z.array(relatedLinkSchema),
});

const discoveryPageSchema = z.object({
  pageType: z.literal('discovery'),
  pageSlug: z.literal('discovery'),
  lang: langSchema,
  title: z.string(),
  description: z.string(),
  h1: z.string(),
  lead: z.string(),
  datePublished: dateSchema,
  updatedAt: dateSchema,
  manifestRules: tableSchema.extend({
    nuances: z.array(z.string()),
  }),
  cargoPublishQuirk: z.object({
    heading: z.string(),
    explanation: z.string(),
    snippet: z.string(),
  }),
  channelsTable: tableSchema,
  acceptedTable: tableSchema,
  exclusionsTable: tableSchema,
  relatedLinks: z.array(relatedLinkSchema),
});

const aboutPageSchema = z.object({
  pageType: z.literal('about'),
  pageSlug: z.literal('about'),
  lang: langSchema,
  title: z.string(),
  description: z.string(),
  h1: z.string(),
  lead: z.string(),
  datePublished: dateSchema,
  updatedAt: dateSchema,
  whoHeading: z.string(),
  how: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
    pipelineScripts: z.array(
      z.object({
        script: z.string(),
        role: z.string(),
      }),
    ),
  }),
  why: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
  }),
  criteria: z.object({
    heading: z.string(),
    inclusion: z.array(z.string()),
    exclusion: z.array(z.string()),
  }),
  verificationBoundary: z.object({
    heading: z.string(),
    summary: z.string(),
    verifiedItems: z.array(z.string()),
    notVerifiedItems: z.array(z.string()),
  }),
  securityPolicy: calloutSchema,
  contributing: z.object({
    heading: z.string(),
    body: z.string(),
    contributingUrl: z.string().url(),
  }),
  relatedLinks: z.array(relatedLinkSchema),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.discriminatedUnion('pageType', [
    homePageSchema,
    sectionPageSchema,
    discoveryPageSchema,
    aboutPageSchema,
  ]),
});

export const collections = { entries, modules, pages };
