import { Star } from "lucide-react";

/** 5 stars with partial fill, e.g. 4.7 fills the last star 70% */
const Stars = ({ rating }: { rating: number }) => (
  <span
    className="inline-flex"
    role="img"
    aria-label={`Rated ${rating} out of 5`}
  >
    {Array.from({ length: 5 }, (_, i) => {
      const fill = Math.min(1, Math.max(0, rating - i));
      return (
        <span key={i} className="relative inline-block size-4">
          <Star
            className="absolute inset-0 size-4 text-gray-300"
            fill="currentColor"
            strokeWidth={0}
          />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${fill * 100}%` }}
          >
            <Star
              className="size-4 text-amber-400"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        </span>
      );
    })}
  </span>
);

export default Stars;
