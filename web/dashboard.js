const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function buildViewModel(result, member) {
  const progressPercent = Math.min(
    100,
    (member.pointsThisMonth / member.monthlyCap) * 100,
  );

  // Fix Bug 02 (Frontend):
  // Read `result.outcome` directly from the domain result rather than always assuming success.
  // For duplicate deliveries (DUPLICATE), render a neutral state indicating the webhook was skipped.
  if (result.outcome === "DUPLICATE") {
    return {
      title: "Duplicate event skipped",
      description:
        "This payment webhook was already processed, so no additional points were added.",
      tone: "neutral",
      progressPercent,
    };
  }

  // When blocked by the 100,000 monthly cap (CAPPED), render a warning state.
  if (result.outcome === "CAPPED") {
    return {
      title: "Monthly cap reached",
      description:
        "You've reached the 100,000-point monthly limit, so no additional points were awarded.",
      tone: "warning",
      progressPercent,
    };
  }

  // Default state (AWARDED): points were credited successfully.

  return {
    title: `${numberFormatter.format(result.pointsAwarded)} points credited`,
    description: "Your rent payment was processed successfully.",
    tone: "success",
    progressPercent,
  };
}

export function renderDashboard(result, member) {
  const view = buildViewModel(result, member);

  document.querySelector("[data-status]").className =
    `rounded-2xl border p-5 ${toneClasses[view.tone]}`;
  document.querySelector("[data-status-title]").textContent = view.title;
  document.querySelector("[data-status-description]").textContent =
    view.description;
  document.querySelector("[data-points]").textContent = numberFormatter.format(
    member.pointsThisMonth,
  );
  document.querySelector("[data-streak]").textContent =
    `${member.streakMonths} month streak`;
  document.querySelector("[data-progress]").style.width =
    `${view.progressPercent}%`;
  document.querySelector("[data-progress-label]").textContent =
    `${Math.round(view.progressPercent)}% of monthly cap`;
}
