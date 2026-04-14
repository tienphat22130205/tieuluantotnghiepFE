const FriendsSection = ({ title, subtitle, actionText, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actionText && (
        <button type="button" className="text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          {actionText}
        </button>
      )}
    </div>
    {children}
  </section>
)

export default FriendsSection
