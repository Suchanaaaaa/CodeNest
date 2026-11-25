
const languages = [
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

export default function LanguageSelector({
  language,
  setLanguage,
}) {
  return (
    <select
      className="language-select"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      {languages.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
