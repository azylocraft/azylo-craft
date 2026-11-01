/** Product page skeleton (design screen 30). */
export default function Loading() {
  return (
    <div className="px-4 pt-6 md:px-12" aria-busy="true" aria-label="Loading">
      <div className="az-skeleton h-3 w-56 rounded" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="az-skeleton aspect-[4/3.4] rounded-block" />
        <div className="flex flex-col gap-4">
          <div className="az-skeleton h-3 w-32 rounded" />
          <div className="az-skeleton h-9 w-full rounded-lg" />
          <div className="az-skeleton h-9 w-2/3 rounded-lg" />
          <div className="az-skeleton h-7 w-40 rounded-lg" />
          <div className="az-skeleton h-[140px] rounded-tile" />
          <div className="az-skeleton h-12 rounded-field" />
          <div className="az-skeleton h-12 rounded-field" />
          <div className="az-skeleton h-[54px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
