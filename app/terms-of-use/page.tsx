"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

const TermsOfUse = () => {
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
            📜 Terms of Use
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
            Welcome to Raxti.app. By using our services, you agree to the
            following terms and conditions (&quot;Terms&quot;). Please read them
            carefully. If you do not agree with these Terms, do not use our
            platform.
          </p>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Overview
            </h2>
            <p className="text-gray-700 mb-4">
              Raxti.app is a web-based platform that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>
                Transcribe YouTube videos and audio files using AI (Whisper by
                OpenAI)
              </li>
              <li>
                Generate summaries, notes, and action items via ChatGPT
              </li>
              <li>
                Store and manage transcribed content via a simple dashboard
              </li>
            </ul>
            <p className="text-gray-700">
              These services are intended for personal or business use, but not
              for any unlawful or abusive purposes.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. User Responsibilities
            </h2>
            <p className="text-gray-700 mb-4">
              By using Raxti.app, you agree that you will:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>
                Use the platform in accordance with all applicable laws
              </li>
              <li>
                Not upload or link to any content that you do not have the legal
                right to process
              </li>
              <li>
                Not attempt to reverse engineer, hack, overload, or disrupt our
                service
              </li>
              <li>
                Not use the tool to process sensitive or confidential third-party
                data without consent
              </li>
            </ul>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate access to users who
              violate these terms.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Account &amp; Access
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Some features (e.g., Pro Dashboard) may require account
                registration and/or active subscription
              </li>
              <li>
                You are responsible for keeping your login credentials secure
              </li>
              <li>
                We may limit or revoke access at our sole discretion if there is
                a breach of these Terms
              </li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Intellectual Property
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                All code, UI elements, and original site content belong to
                Raxti.app
              </li>
              <li>Uploaded content remains your property</li>
              <li>
                AI-generated outputs (summaries, transcripts) are provided
                &quot;as-is&quot; with no claim of ownership by us
              </li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Use of Third-Party APIs
            </h2>
            <p className="text-gray-700 mb-4">Our service relies on:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>
                OpenAI APIs for transcription (Whisper) and summaries (GPT)
              </li>
              <li>
                YouTube Data API or RapidAPI for video processing
              </li>
            </ul>
            <p className="text-gray-700">
              By using Raxti.app, you also agree to comply with the terms of
              these third-party services.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Limitations &amp; Disclaimers
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>
                We do not guarantee 100% transcription or summary accuracy
              </li>
              <li>
                Service availability may vary due to external API limits or
                server load
              </li>
              <li>
                Raxti.app is not responsible for any damages arising from the
                use of our service or outputs
              </li>
            </ul>
            <p className="text-gray-700">
              All content is provided on an &quot;as-is&quot; and
              &quot;as-available&quot; basis.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Termination
            </h2>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your access:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>If you breach these Terms</li>
              <li>If required by law</li>
              <li>If you misuse the platform or API resources</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Privacy &amp; Data
            </h2>
            <p className="text-gray-700">
              See our{" "}
              <Link
                href="/privacy-policy"
                className="text-steno-blue hover:text-steno-darkBlue transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              to learn how we collect and handle your data. By using Raxti.app,
              you also agree to that policy.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to These Terms
            </h2>
            <p className="text-gray-700">
              We may update these Terms from time to time. Continued use of the
              platform after changes take effect means you accept the new Terms.
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms or your use of Raxti.app,
              contact us:
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

export default TermsOfUse;
