import Logo from './Logo';

/** Shown when no Firebase config is present, instead of a blank crash. */
export default function SetupScreen() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-xl p-8">
        <Logo />
        <h1 className="text-3xl mt-6">Connect a Firebase project</h1>
        <p className="text-muted mt-2">Kharcha stores your data in your own Firebase project. It needs the web config before it can start.</p>
        <ol className="list-decimal pl-5 mt-5 space-y-2">
          <li>Copy <code className="font-bold">.env.example</code> to <code className="font-bold">.env</code> in the project folder.</li>
          <li>Paste the values from Firebase console, Project settings, Your apps.</li>
          <li>Restart <code className="font-bold">npm run dev</code>.</li>
        </ol>
        <p className="text-muted mt-5 text-sm">To try it locally without a project, set <code className="font-bold">VITE_USE_EMULATORS=true</code> and run <code className="font-bold">npm run emulators</code>. The README has the full steps.</p>
      </div>
    </main>
  );
}
