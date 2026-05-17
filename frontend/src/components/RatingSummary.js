import React from "react";

const renderStars = (rating) => {
  const r = Number(rating) || 0;
  const count = Math.max(0, Math.min(5, Math.round(r)));
  return "★".repeat(count) + "☆".repeat(5 - count);
};

function RatingSummary({ summary }) {
  const average_rating = summary?.average_rating ?? 0;
  const total_reviews = summary?.total_reviews ?? 0;

  // Optional stats (only if backend provides them)
  const fiveStarCount = summary?.five_star_count;
  const fourStarCount = summary?.four_star_count;

  const hasOptionalStats =
    typeof fiveStarCount === "number" &&
    typeof fourStarCount === "number" &&
    total_reviews > 0;

  const fivePct = hasOptionalStats
    ? Math.round((fiveStarCount / total_reviews) * 100)
    : 0;
  const fourPct = hasOptionalStats
    ? Math.round((fourStarCount / total_reviews) * 100)
    : 0;

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div>
          <span style={{ color: "#fbbf24", fontSize: 18 }}>⭐</span>{" "}
          <span style={{ fontWeight: 800 }}>{average_rating}</span>
        </div>

        <div style={{ color: "#0f172a" }}>
          <span style={{ marginRight: 6 }}>📝</span>
          <span style={{ fontWeight: 800 }}>{total_reviews}</span>
          <span style={{ color: "#64748b", fontWeight: 600 }}>
            Total Reviews
          </span>
        </div>
      </div>

      <div style={{ marginTop: 8, color: "#f59e0b" }} title={`Average: ${average_rating}`}>
        <span
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
          }}
        >
          {renderStars(average_rating)}
        </span>
      </div>

      {hasOptionalStats && (
        <div className="mt-3">
          <div className="mb-2">
            <div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>⭐ 5 Star</span>
              <span style={{ color: "#64748b" }}>{fiveStarCount} ({fivePct}%)</span>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${fivePct}%`, background: "#fbbf24" }}
              />
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>⭐ 4 Star</span>
              <span style={{ color: "#64748b" }}>{fourStarCount} ({fourPct}%)</span>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${fourPct}%`, background: "#f59e0b" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default RatingSummary;

