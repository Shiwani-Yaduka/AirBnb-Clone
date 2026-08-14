export const metadata = { title: "Privacy Policy — Airbnb Clone" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-neutral-500">
        This is a student fullstack assignment, not a real company — this page is a placeholder,
        not a legally binding policy.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">What we collect</h2>
          <p>
            Account details (name, email, avatar) via Clerk when you sign up, and the listings,
            bookings, reviews, and favorites you create while using the app.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">How it&apos;s used</h2>
          <p>
            Solely to run the app&apos;s features — showing your trips, your host dashboard, and
            your wishlist. Nothing is sold or shared with third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-neutral-900">Payment data</h2>
          <p>
            The checkout flow is mocked for demo purposes. No real payment details are ever
            collected or transmitted.
          </p>
        </section>
      </div>
    </div>
  );
}
