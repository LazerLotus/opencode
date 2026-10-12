export const worldDesigns = [
  {
    id: "kinetic",
    gap: 8,
    name: "Kinetic",
    line: "Command the momentum",
    navigation: "start",
  },
  {
    id: "symbiont",
    gap: 20,
    name: "Symbiont",
    line: "Give your ideas roots",
    navigation: "start",
  },
  {
    id: "parallax",
    gap: 16,
    name: "Parallax",
    line: "A different point of view",
    navigation: "end",
  },
  {
    id: "chorus",
    gap: 0,
    name: "Chorus",
    line: "Many minds. Your rhythm.",
    navigation: "start",
  },
  {
    id: "broodmind",
    gap: 18,
    name: "Broodmind",
    line: "Work as one organism",
    navigation: "end",
  },
  {
    id: "quanta",
    gap: 12,
    name: "Quanta",
    line: "Build a universe of ideas",
    navigation: "start",
  },
  {
    id: "raidweaver",
    gap: 14,
    name: "Raidweaver",
    line: "Gather your party",
    navigation: "start",
  },
  {
    id: "nightwatch",
    gap: 8,
    name: "Nightwatch",
    line: "Keep the whole picture",
    navigation: "end",
  },
  {
    id: "commonplace",
    gap: 24,
    name: "Commonplace",
    line: "Make room for judgment",
    navigation: "start",
  },
  {
    id: "switchyard",
    gap: 6,
    name: "Switchyard",
    line: "Put good work on track",
    navigation: "start",
  },
  {
    id: "orchard",
    gap: 24,
    name: "Orchard",
    line: "Let possibilities grow",
    navigation: "start",
  },
] as const

export type WorldDesign = (typeof worldDesigns)[number]["id"]

export function resolveWorldDesign(value: unknown) {
  return worldDesigns.find((design) => design.id === value) ?? worldDesigns[0]
}
