export function YouTubeBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/nGnX6GkrOgk?autoplay=1&mute=1&loop=1&playlist=nGnX6GkrOgk&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1"
          className="absolute top-1/2 left-1/2 w-[177.77777778vh] h-[56.25vw] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2"
          allow="autoplay; encrypted-media"
          style={{ border: 'none', pointerEvents: 'none' }}
        />
        {}
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
  );
}
