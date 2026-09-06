"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        {/* Logo and navigation */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/">
              <img
                src="/images/logo.png"
                alt="raxti.app logo"
                className="h-24"
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-steno-blue hover:text-steno-darkBlue transition-colors"
            >
              Home
            </Link>
            <Link
              href="/how-it-works"
              className="text-steno-blue hover:text-steno-darkBlue transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pro"
              className="text-steno-blue hover:text-steno-darkBlue transition-colors font-medium"
            >
              PRO
            </Link>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            📄 Privacy Policy for Raxti.app
          </h1>

          <div className="text-sm text-gray-600 mb-8">
            <p>
              <strong>Effective Date:</strong> May 27, 2025
            </p>
            <p>
              <strong>Last Updated:</strong> May 27, 2025
            </p>
          </div>

          <p className="text-gray-700 mb-8">
            Welcome to Raxti.app (&quot;we&quot;, &quot;our&quot;,
            &quot;us&quot;). We care deeply about your privacy and are committed
            to protecting your personal data. This Privacy Policy explains how
            we collect, use, and protect your information when you use our
            services.
          </p>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. What Data We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              We only collect the data necessary to provide and improve our
              service:
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ✅ Data You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  <strong>Audio Files / Voice Memos</strong> – Uploaded for
                  transcription.
                </li>
                <li>
                  <strong>YouTube URLs</strong> – Used for extracting and
                  transcribing video audio.
                </li>
                <li>
                  <strong>User Inputs</strong> – Text content, queries, notes,
                  preferences.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                📊 Automatically Collected
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  <strong>Device/Browser Information</strong> (e.g., IP
                  address, user-agent)
                </li>
                <li>
                  <strong>Usage Logs</strong> (e.g., session duration, errors)
                </li>
                <li>
                  <strong>Cookies / Local Storage</strong> (to maintain session
                  state)
                </li>
              </ul>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. How We Use Your Data
            </h2>
            <p className="text-gray-700 mb-4">We use your data to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                Transcribe and summarize content using AI (OpenAI Whisper + GPT)
              </li>
              <li>
                Improve and optimize Raxti&apos;s performance and features
              </li>
              <li>Send transactional messages (if applicable)</li>
              <li>Comply with legal requirements</li>
            </ul>
            <p className="text-gray-700 mt-4 font-medium">
              We do not use your audio or transcripts for advertising or model
              training.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Data Storage &amp; Retention
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Uploaded audio and transcription data are stored temporarily and
                deleted regularly unless explicitly saved by the user.
              </li>
              <li>
                Transcripts and summaries stored in your account are under your
                control and can be deleted anytime.
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              We make every effort to minimize data retention and give you
              control over your content.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Third-Party Services
            </h2>
            <p className="text-gray-700 mb-4">
              We may use trusted third-party services for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                <strong>AI Processing:</strong> OpenAI (Whisper, GPT APIs)
              </li>
              <li>
                <strong>YouTube Data:</strong> RapidAPI, YouTube Data API
              </li>
              <li>
                <strong>Analytics</strong> (e.g., Plausible Analytics or similar
                privacy-focused tools)
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              All third-party tools comply with GDPR and process data under
              strict confidentiality agreements.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 mb-4">We use:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>SSL encryption for all communications</li>
              <li>Role-based access controls</li>
              <li>Regular code audits and backups</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We take reasonable technical and organizational measures to secure
              your data.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Your Rights (GDPR &amp; CCPA)
            </h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Access, update, or delete your personal data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise any of these rights, contact us at:{" "}
              <a
                href="mailto:martins@vilums.co"
                className="text-steno-blue hover:text-steno-darkBlue transition-colors"
              >
                martins@vilums.co
              </a>
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700">
              Raxti.app is not intended for users under the age of 13. We do not
              knowingly collect data from minors.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700">
              We may update this Privacy Policy as the product evolves.
              Significant changes will be communicated via email or in-app
              notice.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this policy or your data, reach out
              anytime:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                📧{" "}
                <a
                  href="mailto:martins@vilums.co"
                  className="text-steno-blue hover:text-steno-darkBlue transition-colors"
                >
                  martins@vilums.co
                </a>
              </p>
              <p className="text-gray-700">
                🌐{" "}
                <a
                  href="https://raxti.app"
                  className="text-steno-blue hover:text-steno-darkBlue transition-colors"
                >
                  https://raxti.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
