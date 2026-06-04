const FriendsSection = ({ title, subtitle, actionText, onActionClick, rightElement, children }) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {rightElement && <div className="w-full sm:w-auto">{rightElement}</div>}
      {actionText && onActionClick && !rightElement && (
        <button
          type="button"
          onClick={onActionClick}
          className="text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
    {children}
  </section>
)

export default FriendsSection
