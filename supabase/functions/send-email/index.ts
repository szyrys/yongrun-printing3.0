// @ts-ignore
// @supabase-functions-ignore-jwt

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  // 允许所有请求（已通过顶部注释禁用 JWT）
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const { name, email, phone, message } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not set')
    }

    const emailContent = `
New message from website:

Name: ${name}
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}
Message:
${message}
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
       to: ['541082529@qq.com'],
        subject: `New message from ${name}`,
        text: emailContent,
      }),
    })

    const result = await res.json()

    if (!res.ok) throw new Error(result.message)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})