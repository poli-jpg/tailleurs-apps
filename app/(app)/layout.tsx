import { BarreNav } from '@/components/BarreNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto min-h-screen max-w-md pb-28">{children}</div>
      <BarreNav />
    </>
  );
}
