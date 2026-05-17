import React from "react";

const renderStars = (rating) => {
  const r = Number(rating) || 0;
  const count = Math.max(0, Math.min(5, Math.round(r)));
  return "★".repeat(count) + "☆".repeat(5 - count);
};

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const initials = (first + last).toUpperCase();
  return initials || "?";
}

function ReviewRatingCard({ review }) {
  if (!review) return null;

  const hasReply =
    review.admin_reply !== null &&
    review.admin_reply !== undefined &&
    String(review.admin_reply).trim() !== "";

  return (
    <div className="review-card modern">
      <div className="sp-review-head">
        <div className="sp-review-meta">
          <div className="sp-avatar" aria-hidden="true">
            {getInitials(review.user_name || "Anonymous")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="sp-review-name">{review.user_name || "Anonymous"}</div>
            <div className="sp-review-date">📅 {review.created_at}</div>
          </div>
        </div>

        <div
          className="text-warning"
          style={{ fontSize: 14, whiteSpace: "nowrap" }}
          aria-label={`Rating: ${review.rating}`}
          title={`Rating: ${review.rating}`}
        >
          {renderStars(review.rating)}
        </div>
      </div>

      <div className="sp-review-text">{review.review || "-"}</div>

      {hasReply && (
        <div className="sp-admin-reply">
          <div className="sp-admin-reply-title">💬 Admin Reply</div>
          <div className="sp-admin-reply-text">“{review.admin_reply}”</div>
        </div>
      )}
    </div>
  );
}

export default ReviewRatingCard;


