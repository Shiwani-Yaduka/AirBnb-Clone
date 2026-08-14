export const metadata = { title: "Terms of Service — Airbnb Clone" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold">Terms of Service</h1>
      <p className="mb-8 text-sm text-neutral-500">
        This is a student fullstack assignment, not a real company — this page is a placeholder,
        not a binding agreement.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">Demo only</h2>
          <p>
            Bookings, payments, and reviews created here are for demonstration purposes. No real
            money changes hands and no real stays are arranged.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">Accounts</h2>
          <p>
            Sign-in is handled by Clerk. You&apos;re responsible for keeping your account secure;
            we don&apos;t store passwords for Clerk-authenticated accounts ourselves.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">Hosting</h2>
          <p>
            Anyone can list a property. Listings, photos, and descriptions are user-submitted and
            not verified — this mirrors the real Airbnb&apos;s host/guest model for the assignment,
            not an actual marketplace.
          </p>
        </section>
      </div>
    </div>
  );
}
