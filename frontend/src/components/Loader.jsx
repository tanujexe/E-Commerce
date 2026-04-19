

export default function Loader({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} border-3 border-dark-200 border-t-primary-500 rounded-full animate-spin`}
      style={{ borderWidth: '3px' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-dark-500 font-medium animate-pulse-slow">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {spinner}
    </div>
  );
}
