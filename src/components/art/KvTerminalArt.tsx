import s from "./art.module.css";

/** The documented KVStore session from kv_store/README.md, verbatim. */
const session: { text: string; tone: "cmd" | "reply" | "ok" | "prompt" }[] = [
  { text: "$ nc localhost 8080", tone: "prompt" },
  { text: "SET name Alice", tone: "cmd" },
  { text: "+OK", tone: "ok" },
  { text: "GET name", tone: "cmd" },
  { text: "$5", tone: "reply" },
  { text: "Alice", tone: "reply" },
  { text: "SET session_token abc PX 5000", tone: "cmd" },
  { text: "+OK", tone: "ok" },
  { text: "DEL name", tone: "cmd" },
  { text: ":1", tone: "reply" },
];

const tone = { cmd: "", reply: s.reply, ok: s.ok, prompt: s.prompt } as const;

export function KvTerminalArt({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`${s.frame} ${className}`}>
      <div className={s.terminal}>
        <div className={s.terminalBar}>
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.terminalTitle}>kv_store — nc</span>
        </div>
        <pre className={s.terminalBody}>
          {session.map((line, i) => (
            <span key={i} className={tone[line.tone]}>
              {line.text}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}
