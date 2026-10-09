"use client";

import { FormEvent, useState } from "react";
import { Check, Send } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  if (submitted) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.75rem] border border-emerald-200 bg-[#F2FBF6] p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check size={28} /></span>
        <h2 className="mt-6 text-2xl font-semibold text-slate-900">Message received.</h2>
        <p className="mt-3 max-w-sm leading-7 text-slate-600">Thanks for reaching out. Our team will review your message and get back to you within one business day.</p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn btn-secondary mt-6">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">Name<input required name="name" type="text" placeholder="Your name" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none transition placeholder:text-slate-400 focus:border-[#6F3DD0] focus:ring-4 focus:ring-[#6F3DD0]/10" /></label>
        <label className="text-sm font-semibold text-slate-800">Email<input required name="email" type="email" placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none transition placeholder:text-slate-400 focus:border-[#6F3DD0] focus:ring-4 focus:ring-[#6F3DD0]/10" /></label>
      </div>
      <label className="mt-5 block text-sm font-semibold text-slate-800">What can we help with?<select name="topic" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-normal text-slate-700 outline-none focus:border-[#6F3DD0] focus:ring-4 focus:ring-[#6F3DD0]/10"><option>Product advice</option><option>Order question</option><option>Delivery and payment</option><option>After-sales support</option></select></label>
      <label className="mt-5 block text-sm font-semibold text-slate-800">Message<textarea required name="message" rows={5} placeholder="Tell us a little about what you need..." className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-[#6F3DD0] focus:ring-4 focus:ring-[#6F3DD0]/10" /></label>
      <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto">Send message <Send size={17} /></button>
    </form>
  );
}