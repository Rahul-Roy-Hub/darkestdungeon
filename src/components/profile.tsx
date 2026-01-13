import { gameContract } from '~/lib/alchemy';
import { useAccount, useReadContract } from 'wagmi';
import { ProfileTable } from './profile-table';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const ProfileDetails = () => {
  const { address, isConnected } = useAccount();
  
  const { 
    data: profileData, 
    refetch: refetchProfileData,
    isLoading,
    isError,
    error
  } = useReadContract({
    abi: gameContract.abi,
    address: gameContract.address as `0x${string}`,
    functionName: 'getPlayRecords',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  console.log("Profile data:", profileData);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  if (!isConnected || !address) {
    return (
      <div className='absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-6'>
        <div className='font-golondrina text-7xl mb-6'>Profile Details</div>
        <div className='flex flex-col items-center justify-center py-12'>
          <p className='text-xl text-neutral-300 mb-6'>Please connect your wallet to view your profile</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className='absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-6 max-h-[80vh] overflow-y-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div className='font-golondrina text-7xl'>Profile Details</div>
        <Button
          onClick={() => refetchProfileData()}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <p className='text-xl text-neutral-300'>Loading profile data...</p>
        </div>
      )}
      
      {isError && (
        <div className='flex flex-col items-center justify-center py-12'>
          <p className='text-xl text-red-400 mb-4'>Error loading profile data</p>
          <p className='text-sm text-neutral-400'>{error?.message || 'Unknown error occurred'}</p>
          <Button onClick={() => refetchProfileData()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && (
        <ProfileTable
          // @ts-expect-error -- safe for read-only
          data={profileData ?? []}
        />
      )}
    </div>
  );
};
