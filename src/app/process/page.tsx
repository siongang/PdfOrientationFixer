'use client';

import { useSearchParams } from 'next/navigation';

export default function ProcessPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('ids');
  const fileIds = raw ? JSON.parse(raw) : [];
  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white">
      <div>
        {fileIds.map((id: string, index: number) => (
            
          <div key={id} >
            <p>File ID: {id}</p>
            {/* You can fetch or preview the file using this ID */}
          </div>
        ))}
        {/* You can fetch or preview the file using this ID */}
      </div>
      <div>
        mji
      </div>
    </main>
  );
}
