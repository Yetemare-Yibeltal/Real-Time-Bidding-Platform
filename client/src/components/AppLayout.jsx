// src/components/AppLayout.jsx
export const AppLayout = ({ children }) => (
  <div className='min-h-screen w-full flex flex-col p-6 bg-slate-950 text-white overflow-x-hidden'>
    <main className='flex-1 w-full max-w-[1920px] mx-auto grid grid-cols-12 gap-8'>
      {children}
    </main>
  </div>
)
