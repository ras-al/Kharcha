import LoginForm from '../../components/LoginForm';
import LegalLinks from '../../components/LegalLinks';
import Logo from '../../components/Logo';

export default function LoginDesktop() {
  return (
    <main className="min-h-screen grid grid-cols-[1.1fr_1fr]">
      <section className="bg-hero text-hero-ink dark:border-r dark:border-line px-16 py-14 flex flex-col">
        <Logo inverted className="[&>span]:text-hero-ink" />
        <div className="my-auto max-w-[560px]">
          <h1 className="text-[64px] leading-[1.02] text-hero-ink">Know where every rupee went.</h1>
          <p className="text-[19px] mt-5 text-hero-muted">Daily spending, college fees, hostel rent and scholarships, in one place that works offline.</p>
        </div>
      </section>
      <section className="grid place-items-center px-10">
        <div className="w-full max-w-[400px]">
          <h2 className="text-[32px]">Sign in</h2>
          <p className="text-muted mt-1 mb-8">Your data stays in your own account.</p>
          <LoginForm />
          <LegalLinks className="text-center mt-8" />
        </div>
      </section>
    </main>
  );
}
