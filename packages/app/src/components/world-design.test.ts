import { describe, expect, test } from "bun:test"
import { worldDesigns, resolveWorldDesign } from "./world-design"

describe("world design preferences", () => {
  test("old and unknown preferences open the default cockpit", () => {
    expect(resolveWorldDesign(undefined).id).toBe("kinetic")
    expect(resolveWorldDesign("removed-design").id).toBe("kinetic")
    expect(resolveWorldDesign(null).id).toBe("kinetic")
  })

  test("restores every supported presentation without selecting a theme", () => {
    expect(worldDesigns.map((design) => design.id)).toEqual([
      "kinetic",
      "symbiont",
      "parallax",
      "chorus",
      "broodmind",
      "quanta",
      "raidweaver",
      "nightwatch",
      "commonplace",
      "switchyard",
      "orchard",
    ])
    for (const design of worldDesigns) {
      expect(resolveWorldDesign(design.id)).toBe(design)
      expect(design).not.toHaveProperty("theme")
    }
  })
})
