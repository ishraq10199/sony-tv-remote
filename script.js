document.querySelector("#power").addEventListener("click", () => {
  console.log("Power button");
});

const numsEl = document.querySelector("#nums");
const baseButtonClasses = [
  "inline-flex",
  "h-20",
  "items-center",
  "justify-center",
  "px-6",
  "font-medium",
  "bg-neutral-950",
  "text-neutral-50",
];

const numButtonClasses = [
  ...baseButtonClasses,
  "rounded-md",
  "shadow-md",
  "transition",
  "active:scale-95",
  "cursor-pointer",
];

for (let i = 0; i < 10; i++) {
  const num = (i + 1) % 10;

  if (num === 0) {
    const padLeftOfZero = document.createElement("span");
    padLeftOfZero.classList.add(...baseButtonClasses, "opacity-0");
    numsEl.appendChild(padLeftOfZero);
  }

  const button = document.createElement("button");
  button.classList.add(...numButtonClasses);

  button.innerText = num;
  numsEl.appendChild(button);
}
