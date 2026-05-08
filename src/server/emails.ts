'use server';

import { env } from '@/env.mjs';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

function isLocalEmailStub() {
  return (
    process.env.NODE_ENV === 'development' &&
    env.RESEND_API_KEY === 'local-resend-placeholder'
  );
}

export interface Email {
  react: ReactElement;
  subject: string;
  to: string[];
  from?: string;
}

export const sendEmail = async (email: Email) => {
  if (isLocalEmailStub()) {
    console.log('[email:stub]', {
      to: email.to,
      subject: email.subject,
    });
    return { data: null, error: null };
  }

  return await resend.emails.send({
    from: 'Vanxh <hello@vanxh.dev>',
    ...email,
  });
};
