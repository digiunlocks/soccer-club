import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Required";
    if (!form.email) newErrors.email = "Required";
    if (!form.subject) newErrors.subject = "Required";
    if (!form.message) newErrors.message = "Required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-900">Contact Us</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-semibold">Name <span className="text-red-600">*</span></label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
          {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
        </div>
        <div>
          <label className="font-semibold">Email <span className="text-red-600">*</span></label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
          {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
        </div>
        <div>
          <label className="font-semibold">Subject <span className="text-red-600">*</span></label>
          <input type="text" name="subject" value={form.subject} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" required />
          {errors.subject && <div className="text-xs text-red-600">{errors.subject}</div>}
        </div>
        <div>
          <label className="font-semibold">Message <span className="text-red-600">*</span></label>
          <textarea name="message" value={form.message} onChange={handleChange} className="border border-green-300 rounded px-3 py-2 w-full" rows={4} required />
          {errors.message && <div className="text-xs text-red-600">{errors.message}</div>}
        </div>
        <button type="submit" className="bg-green-900 text-white font-bold py-2 rounded hover:bg-green-700 transition">Send Message</button>
        {submitted && <div className="text-green-700 font-semibold mt-2">Thank you for contacting us! We will get back to you soon.</div>}
      </form>
    </div>
  );
} 