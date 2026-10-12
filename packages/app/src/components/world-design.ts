export const worldDesigns = [
  {
    id: "kinetic",
    gap: 8,
    name: "Kinetic",
    line: "Command the momentum",
    detail: "An instrument deck with a mission rail and precise, open panels.",
    navigation: "start",
  },
  {
    id: "symbiont",
    gap: 20,
    name: "Symbiont",
    line: "Give your ideas roots",
    detail: "A spacious garden of soft surfaces and branching lines.",
    navigation: "start",
  },
  {
    id: "parallax",
    gap: 16,
    name: "Parallax",
    line: "A different point of view",
    detail: "A panoramic workspace with navigation on the opposite horizon.",
    navigation: "end",
  },
  {
    id: "chorus",
    gap: 0,
    name: "Chorus",
    line: "Many minds. Your rhythm.",
    detail: "Horizontal score markings and a compact conductor’s desk.",
    navigation: "start",
  },
  {
    id: "broodmind",
    gap: 18,
    name: "Broodmind",
    line: "Work as one organism",
    detail: "An organic cortex framed by curved membranes and connected nodes.",
    navigation: "end",
  },
  {
    id: "quanta",
    gap: 12,
    name: "Quanta",
    line: "Build a universe of ideas",
    detail: "A pixel lattice, stepped frames and a construction-bench dock.",
    navigation: "start",
  },
  {
    id: "raidweaver",
    gap: 14,
    name: "Raidweaver",
    line: "Gather your party",
    detail: "A quest journal and tactical table inside an angular fortress.",
    navigation: "start",
  },
  {
    id: "nightwatch",
    gap: 8,
    name: "Nightwatch",
    line: "Keep the whole picture",
    detail: "An observatory with radar linework and a right-hand watch station.",
    navigation: "end",
  },
  {
    id: "commonplace",
    gap: 24,
    name: "Commonplace",
    line: "Make room for judgment",
    detail: "An editorial desk with quiet rules, serif headings and generous margins.",
    navigation: "start",
  },
  {
    id: "switchyard",
    gap: 6,
    name: "Switchyard",
    line: "Put good work on track",
    detail: "An industrial workbench with squared panels and a transport strip.",
    navigation: "start",
  },
  {
    id: "orchard",
    gap: 24,
    name: "Orchard",
    line: "Let possibilities grow",
    detail: "Floating islands, rounded panels and an open landscape for your work.",
    navigation: "start",
  },
] as const

export type WorldDesign = (typeof worldDesigns)[number]["id"]

export function resolveWorldDesign(value: unknown) {
  return worldDesigns.find((design) => design.id === value) ?? worldDesigns[0]
}
