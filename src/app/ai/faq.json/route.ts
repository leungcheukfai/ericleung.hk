import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  return Response.json({
    url: `${origin}/ai/faq.json`,
    questions: [
      { question: 'Who is Eric Leung?', answer: siteConfig.description },
      ...(siteConfig.profile.chineseName
        ? [
            {
              question: "What is Eric Leung's Chinese name?",
              answer: `Eric Leung's Chinese name is ${siteConfig.profile.chineseName}.`,
            },
          ]
        : []),
      {
        question: 'Where is Eric Leung based?',
        answer: 'Eric Leung is based in Hong Kong.',
      },
      {
        question: 'What is Eric Leung working on?',
        answer: `${siteConfig.projects
          .map(
            (project) =>
              `${project.name} (${project.url}): ${project.description}`
          )
          .join(' ')}`,
      },
      {
        question: 'How can I contact Eric Leung?',
        answer: `Visit ${origin}/ to find social links or book a meeting.`,
      },
    ],
  });
}
