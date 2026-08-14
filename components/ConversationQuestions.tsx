const QUESTIONS = [
  { emoji: '🤝', text: 'Something we have in common?' },
  { emoji: '💡', text: 'What did you learn through FA PN?' },
  { emoji: '🚀', text: 'What are you working on now?' },
  { emoji: '🔗', text: 'Who or what should I connect with?' },
]

export default function ConversationQuestions() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Conversation starters
      </h2>
      <div className="space-y-2">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-slate-800 rounded-xl px-4 py-3"
          >
            <span className="text-xl shrink-0">{q.emoji}</span>
            <p className="text-sm text-slate-200 leading-snug">{q.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
