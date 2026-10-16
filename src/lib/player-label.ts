export function playerLabel(firstName: string, lastName: string) {
  const initials = Array.from(lastName.trim()).slice(0, 2);
  const surname = initials.map((letter, i) => i === 0 ? letter.toLocaleUpperCase() : letter.toLocaleLowerCase()).join("");
  return [firstName.trim(), surname].filter(Boolean).join(" ");
}