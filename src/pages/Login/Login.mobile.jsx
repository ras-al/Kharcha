import LoginForm from '../../components/LoginForm';
import LegalLinks from '../../components/LegalLinks';
import Logo from '../../components/Logo';

export default function LoginMobile() {
  return (
    <main className="min-h-screen px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-10 max-w-md mx-auto">
      <Logo />
      <h1 className="text-[40px] leading-[1.05] mt-10">Know where every rupee went.</h1>
      <p className="text-muted mt-3 text-[17px]">Log spending in two taps. Keep fees, hostel rent and scholarships in one place.</p>
      <div className="mt-10"><LoginForm /></div>
      <LegalLinks className="text-center mt-8" />
    </main>
  );
}
