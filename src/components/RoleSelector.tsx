import { User } from 'firebase/auth';
import { useState } from 'react';
import { setUserRole } from '../firebaseUser';

interface RoleSelectorProps {
  user: User;
  onRoleSet: (role: 'client' | 'realtor') => void;
}

export function RoleSelector({ user, onRoleSet }: RoleSelectorProps) {
  const [role, setRole] = useState<'client' | 'realtor' | null>(null);

  const handleSelect = async (selected: 'client' | 'realtor') => {
    setRole(selected);
    await setUserRole(user, selected); // Save to Firestore
    onRoleSet(selected);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="text-lg font-semibold">Select your role:</div>
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleSelect('client')}
        >
          Client
        </button>
        <button
          className={`px-4 py-2 rounded ${role === 'realtor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleSelect('realtor')}
        >
          Realtor
        </button>
      </div>
    </div>
  );
}
