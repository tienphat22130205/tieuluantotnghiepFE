const AIGenerateButton = ({ onClick, disabled }) => {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title="AI sinh nội dung"
        className="group rounded-full p-1.5 bg-white border border-gray-200 shadow-sm transition hover:shadow-md hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <img
          src="/botAI.jpeg"
          alt="AI bot"
          className="h-12 w-12 rounded-full object-cover"
        />
      </button>
    </div>
  )
}

export default AIGenerateButton
