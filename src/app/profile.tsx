import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ProfileDetails } from '~/components';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleBack = () => {
    void navigate({ to: '/' });
  };

  return (
    <div className='relative h-screen w-screen overflow-hidden'>
      <img
        alt='background'
        className='absolute h-screen w-full'
        src='/background.png'
      />
      <Button
        onClick={handleBack}
        variant="outline"
        className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 border-neutral-600 text-white"
      >
        <ArrowLeft className="h-10 w-10" />
      </Button>
      <ProfileDetails />
    </div>
  );
}
