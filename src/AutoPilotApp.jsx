/*
AutoPilot AI Systems — React Single Page (updated)
Includes:
- client-side phone validation (pattern + normalization)
- optional reCAPTCHA v3 execution before submit (set VITE_RECAPTCHA_SITE_KEY)
- posts lead to backend /webhooks/lead with recaptchaToken and clientApiKey
*/

import React, { useState, useEffect } from "react";

const CONTACT_EMAIL = "hello@autopilotai.example";

export default function AutoPilotApp() {
  // form state and handler for audit requests
  const [form, setForm] = useState({ name: '', business: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const API = import.meta.env.VITE_API_URL || '';
  const CLIENT_API_KEY = import.meta.env.VITE_CLIENT_API_KEY || '';

  // preload reCAPTCHA script if key provided (v3)
  useEffect(() => {
    const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    if (RECAPTCHA_KEY && !window.__recaptcha_loaded) {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEY}`;
      s.async = true;
      s.onload = () => { window.__recaptcha_loaded = true; };
      document.head.appendChild(s);
    }
  }, []);

  async function validateAndSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    // Normalize and validate phone number (require country code, 8-15 digits)
    const phoneNorm = (form.phone || '').replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?\d{8,15}$/;
    if (!phoneRegex.test(phoneNorm)) {
      setMessage('Please enter a valid phone number with country code, e.g. +919876543210');
      setSubmitting(false);
      return;
    }

    // Optional reCAPTCHA v3: execute and get token if site key provided
    const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    let recaptchaToken = '';
    if (RECAPTCHA_KEY && window.grecaptcha && window.grecaptcha.execute) {
      try {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_KEY, { action: 'submit' });
      } catch (err) {
        console.warn('reCAPTCHA execution failed', err);
      }
    }

    try {
      const payload = {
        lead: { name: form.name, phone: phoneNorm, source: 'site', payload: { business: form.business } },
        clientApiKey: CLIENT_API_KEY,
        recaptchaToken
      };

      const res = await fetch(`${API.replace(/\/+$/,'')}/webhooks/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('Failed to submit: ' + txt);
      }
      setMessage('Thanks — audit requested. We will contact you shortly.');
      setForm({ name: '', business: '', phone: '' });
    } catch (err) {
      console.error(err);
      setMessage('Error submitting. Please email ' + CONTACT_EMAIL);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">AP</div>
            <div>
              <div className="text-lg font-semibold">AutoPilot AI Systems</div>
              <div className="text-sm text-slate-500">Automate tasks. Boost revenue. Install in 24 hours.</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-blue-600">Services</a>
            <a href="#pricing" className="hover:text-blue-600">Pricing</a>
            <a href="#how" className="hover:text-blue-600">How it works</a>
            <a href="#contact" className="text-white bg-blue-600 px-4 py-2 rounded-lg">Book Audit</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Automate tasks. Boost revenue. Install in 24 hours.</h1>
            <p className="mt-4 text-lg text-slate-600">AI automations for SMBs — WhatsApp follow-ups, appointment reminders, onboarding flows — delivered and live within 24–72 hours.</p>

            <div className="mt-6 flex gap-4">
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-medium">Book Free Audit</a>
              <a href="#services" className="inline-flex items-center gap-2 border border-slate-200 px-5 py-3 rounded-lg text-sm">See Services</a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="24–72 hrs" value="Install" />
              <Stat label="₹15k+" value="Setup" />
              <Stat label="₹4k+ / mo" value="Maintenance" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="h-56 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">Demo video placeholder</div>
              <div className="mt-3 text-sm text-slate-600">Show a 60–90s demo: lead enters → bot replies → booking. Record with Loom.</div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-semibold">Quick ROI example</h3>
              <p className="text-sm text-slate-600 mt-2">Replace one staff member (₹25k/month) with automations: Setup ₹20k + Maint ₹6k — break-even in 1 month.</p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mt-16">
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="mt-2 text-slate-600">Pick a turnkey automation and go live in days.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard title="Lead Follow-Up Bot" priceSetup="₹20k" priceMaint="₹6k/mo">
              Instant WhatsApp replies, lead qualification, calendar booking, and CRM sync.
            </ServiceCard>
            <ServiceCard title="Appointment Automation" priceSetup="₹15k" priceMaint="₹5k/mo">
              Reminders, rescheduling, no-show reduction, feedback collection.
            </ServiceCard>
            <ServiceCard title="Real Estate Suite" priceSetup="₹35k" priceMaint="₹8k/mo">
              Buyer nurturing, auto brochures, site-visit scheduling, and escalation to sales.
            </ServiceCard>
            <ServiceCard title="HR Onboarding" priceSetup="₹20k" priceMaint="₹4k/mo">
              Offer letters, document collection, joining reminders, and welcome flows.
            </ServiceCard>
            <ServiceCard title="Coaching Funnel" priceSetup="₹25k" priceMaint="₹5k/mo">
              Lead → nurture → payment → batch allocation — all automated.
            </ServiceCard>
            <ServiceCard title="Custom Automation" priceSetup="Custom" priceMaint="Custom">
              Integration with existing CRM, multi-channel automation, or bespoke flows.
            </ServiceCard>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-16">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <p className="mt-2 text-slate-600">Simple transparent pricing — setup + monthly maintenance. Bundle discounts available.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanCard name="Starter" setup="₹15k" maint="₹4k/mo" features={["1 automation", "Email & WhatsApp", "Basic reporting"]} />
            <PlanCard name="Growth" setup="₹25k" maint="₹6k/mo" features={["Up to 3 automations", "CRM sync", "Weekly tuning"]} popular />
            <PlanCard name="Scale" setup="₹45k" maint="₹10k/mo" features={["Custom flows", "Dedicated support", "Advanced analytics"]} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mt-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step number={1} title="Free 15-min audit">We map your workflows and identify quick wins.</Step>
            <Step number={2} title="Build & Deploy">We deliver in 24–72 hours using Make.com, WhatsApp Cloud API, and OpenAI.</Step>
            <Step number={3} title="Monitor & Improve">We optimize prompts, message timing, and report monthly.</Step>
          </div>
        </section>

        {/* Testimonials / Proof */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Proof</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial quote="We increased follow-ups by 300% in 7 days." by="Real Estate Developer" />
            <Testimonial quote="70% fewer no-shows at our clinic." by="Clinic Owner" />
            <Testimonial quote="Doubled enrollments in 30 days." by="Coaching Institute" />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-16 bg-gradient-to-r from-white to-slate-50 p-8 rounded-2xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold">Book a free audit</h2>
            <p className="text-slate-600 mt-2">15 minutes — we’ll identify the single automation that will move the needle for your business.</p>

            <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={validateAndSubmit}>
              <input required name="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" className="px-4 py-3 rounded-lg border border-slate-200" />
              <input required name="business" value={form.business} onChange={e=>setForm({...form,business:e.target.value})} placeholder="Business name" className="px-4 py-3 rounded-lg border border-slate-200" />
              <input required name="phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone / WhatsApp" inputMode="tel" pattern="\+?\d{8,15}" title="Include country code, e.g. +919876543210" className="px-4 py-3 rounded-lg border border-slate-200" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded-lg">{submitting ? 'Sending...' : 'Request Audit'}</button>
            </form>
            {message && <div className="mt-3 text-sm text-green-600">{message}</div>

            <div className="mt-6 text-sm text-slate-500">Or email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600">{CONTACT_EMAIL}</a></div>
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-slate-500">© {new Date().getFullYear()} AutoPilot AI Systems • Built for quick ROI</footer>
      </main>
    </div>
  );
}


function Stat({label, value}){
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ServiceCard({title, children, priceSetup, priceMaint}){
  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <div className="text-sm text-slate-500">Setup: <strong>{priceSetup}</strong></div>
      </div>
      <p className="mt-3 text-slate-600 text-sm">{children}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">Maint: {priceMaint}</div>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-blue-600">Get demo</a>
      </div>
    </div>
  );
}

function PlanCard({name, setup, maint, features, popular}){
  return (
    <div className={`bg-white rounded-2xl p-6 shadow ${popular? 'ring-2 ring-blue-100':''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-sm text-slate-500">Setup {setup} • {maint}</div>
        </div>
        {popular && <div className="bg-blue-600 text-white px-3 py-1 rounded-xl text-sm">Popular</div>}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {features.map((f,i)=>(<li key={i}>• {f}</li>))}
      </ul>
      <div className="mt-6">
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">Get started</a>
      </div>
    </div>
  );
}

function Step({number, title, children}){
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{number}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-slate-600 mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Testimonial({quote, by}){
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <div className="italic text-slate-700">“{quote}”</div>
      <div className="mt-4 text-sm text-slate-500">— {by}</div>
    </div>
  );
}
